/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

import { AgRendererComponent } from 'ag-grid-angular';

import { DynamicFormService } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import { DataGridCellRendererParams } from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { Tag } from '@acme-priv/armada-angular/src/acme/angular/components/tag';
import { MessageConfig } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

@Component({
	selector: 'app-config-hub-object-name-renderer',
	templateUrl: './object-name-renderer.component.html',
	styleUrls: ['./object-name-renderer.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigHubObjectNameRendererComponent implements AgRendererComponent {
	/**
	 * The cell's object type.
	 */
	public objectType: string;

	/**
	 * The cell parameters passed by the parent.
	 */
	public params: DataGridCellRendererParams;

	/**
	 * Dynamic form used to handle tags
	 */
	public form: Array<any>;

	/**
	 * Flag to indicate whether the list of tag is a form or a read only list
	 */
	public isReadOnly = false;

	/**
	 * Tag collection in case the renderer is read only
	 */
	public tags: Array<Tag> = [];

	constructor(
		private dynamicFormService: DynamicFormService,
		private changeDetection: ChangeDetectorRef
	) {}

	/**
	 * Initializes the ag-grid config.
	 * @param params - data passed in by the parent component
	 */
	public agInit(params: DataGridCellRendererParams): void {
		this.isReadOnly = params.isReadOnly;
		if (params.isReadOnly) {
			this.initializeTags(params);
		} else {
			this.initializeForm(params);
		}
	}

	/**
	 * Recreate the component when cells are refreshed.
	 * @returns {boolean}
	 */
	public refresh(): boolean {
		return true;
	}

	/**
	 * Update object name options on value changes
	 */
	public handleValueChanges(): void {
		const [form] = this.form;
		const includedNames: Array<string> = form.fieldInputs.control.value.map(
			({ displayName }: Tag) => (displayName as MessageConfig).untranslated
		);
		this.params.updateObjectOptions(this.objectType, { includedNames });
		if (this.params.objectOptions.get(this.objectType).includedNames.length > 0 && !this.params.node.isSelected()) {
			this.params.node.setSelected(true);
		}
		this.changeDetection.detectChanges();
	}

	/**
	 * Add tag on blur if value does not exists
	 * @param event Input event
	 */
	public handleFieldBlur({ event }): void {
		const [form] = this.form;
		const currentFormValues = form.fieldInputs.control.value;
		const currentValue = event.currentTarget.value?.trim();
		if (currentValue && !this.tagExists(event.currentTarget.value, currentFormValues)) {
			form.fieldInputs.control.patchValue([
				...form.fieldInputs.control.value,
				{
					displayName: {
						untranslated: currentValue
					},
					data: {
						value: currentValue
					}
				}
			]);
			event.currentTarget.value = '';
		}
	}

	/**
	 * Determines if the display name of some tag already exist according parameters sent
	 * @param value value to check
	 * @param tags list of tags to validate
	 */
	private tagExists(value: string, tags: Array<Tag> = []): boolean {
		return tags.some(tag => tag.data.value === value);
	}

	/**
	 * Initializes form and sets component variables
	 * @param params - data passed in by the parent component
	 */
	private initializeForm(params: DataGridCellRendererParams): void {
		const { tag } = this.dynamicFormService.formItems;

		this.params = params;
		this.objectType = params.data.objectType;
		this.form = [
			tag({
				key: this.objectType,
				placeholder: 'CONFIG_HUB.ENTER_A_NAME',
				value: []
			})
		];
	}

	/**
	 * Initializes tag list and sets component variables
	 * @param params - data passed in by the parent component
	 */
	private initializeTags(params: DataGridCellRendererParams): void {
		this.params = params;
		this.objectType = params.data.objectType;
		this.tags =
			this.params.objectOptions?.[this.objectType]?.includedNames?.map(name => ({
				displayName: { untranslated: name },
				ariaLabel: { untranslated: name },
				readOnly: true,
				color: 'g2'
			})) ?? [];
	}
}

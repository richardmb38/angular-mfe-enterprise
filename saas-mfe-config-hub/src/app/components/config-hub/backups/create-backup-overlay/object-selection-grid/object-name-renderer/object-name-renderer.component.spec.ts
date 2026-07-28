/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';

import { AgGridModule } from 'ag-grid-angular';

import { DataGridCellRendererParams } from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { IncludedNames } from '../../../../shared/models';
import { ConfigHubObjectNameRendererComponent } from './object-name-renderer.component';

describe('ConfigHubObjectSelectionGridComponent', () => {
	let component: ConfigHubObjectNameRendererComponent;
	let fixture: ComponentFixture<ConfigHubObjectNameRendererComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfigHubObjectNameRendererComponent],
			imports: [TranslateModule.forRoot(), AgGridModule],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
			providers: [FormBuilder]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ConfigHubObjectNameRendererComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('agInit', () => {
		it('should call initializeForm if readOnly is false', () => {
			const initializeFormSpy = jest.spyOn(component as any, 'initializeForm');
			const params = {
				isReadOnly: false,
				data: {
					objectType: 'some-type'
				}
			} as unknown as DataGridCellRendererParams;
			component.agInit(params);

			expect(initializeFormSpy).toHaveBeenCalled();
		});

		it('should call initializeTags if readOnly is true', () => {
			const initializeTagsSpy = jest.spyOn(component as any, 'initializeTags');
			const params = {
				isReadOnly: true,
				data: {
					objectType: 'some-type'
				}
			} as unknown as DataGridCellRendererParams;
			component.agInit(params);

			expect(initializeTagsSpy).toHaveBeenCalled();
		});
	});

	describe('initializeForm', () => {
		it('parameters should be initialized', () => {
			const objectOptionsMap = new Map<string, IncludedNames>();
			objectOptionsMap.set('some-type', { includedNames: ['some-name'] });

			const params = {
				data: {
					objectType: 'some-type'
				},
				node: {
					id: 'some-id'
				},
				objectOptions: objectOptionsMap,
				updateObjectOptions: (type: string, names: IncludedNames) => {}
			} as unknown as DataGridCellRendererParams;

			component.agInit(params);

			expect(component.params.node.id).toBe('some-id');
			expect(component.objectType).toBe('some-type');
		});
	});

	describe('handleValueChanges', () => {
		it('should update parent object types and set row as selected', () => {
			const objectOptionsMap = new Map<string, IncludedNames>();
			objectOptionsMap.set('some-type', { includedNames: ['some-name'] });

			const params = {
				data: {
					objectType: 'some-type'
				},
				node: {
					id: 'some-id',
					setSelected: jest.fn(),
					isSelected: () => false
				},
				updateObjectOptions: (type: string, names: IncludedNames) => {},
				objectOptions: objectOptionsMap
			} as unknown as DataGridCellRendererParams;

			component.agInit(params);

			const updateObjectsSpy = jest.spyOn(component.params, 'updateObjectOptions');
			const setSelectedSpy = jest.spyOn(component.params.node, 'setSelected');

			component.form = [
				{ fieldInputs: { control: { value: [{ displayName: { untranslated: 'some-name' } }] } } }
			];
			component.handleValueChanges();

			expect(setSelectedSpy).toHaveBeenCalledWith(true);
			expect(updateObjectsSpy).toHaveBeenCalledWith('some-type', { includedNames: ['some-name'] });
		});
	});

	describe('initializeTags', () => {
		it('should populate tags', () => {
			const params = {
				data: {
					objectType: 'AnObjectType'
				},
				objectOptions: {
					AnObjectType: {
						includedNames: ['name1', 'name2']
					}
				}
			} as unknown as DataGridCellRendererParams;
			(component as any).initializeTags(params);
			expect(component.tags.length).toBe(2);
		});
	});

	describe('handleFieldBlur', () => {
		it('should add tag on blur if form has value', () => {
			const objectOptionsMap = new Map<string, IncludedNames>();

			objectOptionsMap.set('some-type', { includedNames: ['some-name'] });

			const params = {
				data: {
					objectType: 'some-type'
				},
				node: {
					id: 'some-id',
					setSelected: jest.fn(),
					isSelected: () => false
				},
				updateObjectOptions: (type: string, names: IncludedNames) => {},
				objectOptions: objectOptionsMap
			} as unknown as DataGridCellRendererParams;

			component.agInit(params);

			const event = { event: { currentTarget: { value: 'test' } } };

			component.form = [
				{
					fieldInputs: {
						control: {
							value: [{ data: { value: 'some-name' } }],
							patchValue: value => (component.form[0].fieldInputs.control.value = value)
						}
					}
				}
			];

			component.handleFieldBlur(event);

			expect(component.form[0].fieldInputs.control.value.length).toEqual(2);
		});
	});
});

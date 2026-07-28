/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Subject } from 'rxjs';

import { AlertConfig } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import { SlptColDef } from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { ModalConfig } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { NotificationType } from '@acme-priv/armada-angular/src/acme/angular/components/notification-header';
import { Message, TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { IconCellComponent } from '../components/icon-cell/icon-cell.component';
import { IconCellIcons } from '../components/icon-cell/icon-cell.model';
import { ToggleCellComponent } from '../components/toggle-cell/toggle-cell.component';
import { Operation as JSONPatchOperation } from 'fast-json-patch';

export interface ConfigHubObjectMapping {
	/**
	 * Object type
	 */
	objectType: string;

	/**
	 * Json Path used in payload
	 */
	jsonPath?: string;

	/**
	 * Source Value from selected org
	 */
	sourceValue: string;

	/**
	 * Target Value from selected org
	 */
	targetValue: string;

	/**
	 * Enabled from selected org
	 */
	enabled: boolean;

	/**
	 * Id from selected org
	 */
	objectMappingId?: string;
}

export interface ConfigHubObjectMappingCreateApiResponse<T> {
	body: T;
}

export interface ConfigHubObjectMappingPatchApiResponse<T> {
	body: {
		patchedObjects: Array<T>;
	};
}

export interface ConfigHubObjectMappingOptions {
	label: string;
	value: string;
	displayName: Message;
}

/**
 * A model for a dictionary of objectIds to their corresponding JSON patch operations.
 */
export interface ObjectMappingPatchDictionary {
	[objectMappingId: string]: JSONPatchOperation[];
}

/**
 * List of valid object mapping fields
 */
export enum ObjectMappingsValidFields {
	TARGET_VALUE = 'targetValue',
	ENABLED = 'enabled'
}

/**
 * Returns modal configuration for deleting an object mapping.
 * @param objectMapping - object mapping selected for deletion
 * @param sourceTenant - The source tenant for the object mapping
 * @returns {ModalConfig} configuration to be opened by the ModalService.
 */
export function getDeleteObjectMappingModalConfig(
	{ objectType }: ConfigHubObjectMapping,
	sourceTenant: string
): ModalConfig {
	return {
		title: {
			translateKey: 'CONFIG_HUB.DELETE_OBJECT_MAPPING',
			translateParams: { objectType: objectType, sourceTenant }
		},
		message: {
			translateKey: 'CONFIG_HUB.THE_OBJECT_MAPPING_WILL_BE_DELETED',
			translateParams: { objectType: objectType, sourceTenant }
		},
		type: NotificationType.Warning,
		footer: [
			{ label: 'CONFIG_HUB.DELETE', value: true, type: 'primary' },
			{ label: 'CONFIG_HUB.CANCEL', value: false, type: 'secondary' }
		],
		verticallyCentered: false
	};
}

/**
 * Gets an AlertConfig indicating a successful object mapping deletion.
 *
 * @param sourceTenant - name of the selected tenant connection.
 * @param objectMapping - object mapping selected for deletion
 * @param translateService - provides the translateService for html translation.
 * @param translateKey - provides the translateKey for html translation.
 * @returns - Alert config indicating that the delete operation was successful.
 */
export function getDeleteObjectMappingSuccessAlertConfig(
	{ objectType }: ConfigHubObjectMapping,
	translateService: TranslateService,
	translateKey: string
): AlertConfig {
	return {
		html: translateService.instantSafeHtml({
			translateKey: translateKey,
			translateParams: { objectType: objectType }
		}),
		type: NotificationType.Success,
		dismissible: true,
		duration: 4000,
		align: 'top',
		popup: true
	};
}

/**
 * Gets an AlertConfig indicating a successful object mapping action
 *
 * @param translateService - provides the translateService for html translation.
 * @param translateKey - provides the translateKey for html translation.
 * @returns - Alert config indicating that the operation was successful.
 */
export function getObjectMappingSuccessAlertConfig(
	translateService: TranslateService,
	translateKey: string
): AlertConfig {
	return {
		html: translateService.instantSafeHtml({ translateKey }),
		type: NotificationType.Success,
		dismissible: true,
		duration: 4000,
		align: 'top',
		popup: true
	};
}

/**
 * Defines object mapping grid column defs
 */
export const getObjectMappingGridColumnDefs = (
	translateService: TranslateService,
	toggleControl: Subject<{ target: string; value: boolean }>,
	editable: boolean
): SlptColDef[] => {
	return [
		{
			headerName: translateService.instant('CONFIG_HUB.OBJECT_TYPE'),
			field: 'objectType',
			sortable: true,
			sort: 'asc',
			resizable: true
		},
		{
			headerName: translateService.instant('CONFIG_HUB.JSON_PATH'),
			field: 'jsonPath',
			sortable: true,
			suppressSizeToFit: true,
			resizable: true
		},
		{
			headerName: translateService.instant('CONFIG_HUB.ORIGINAL_VALUE'),
			field: 'sourceValue',
			sortable: true,
			suppressSizeToFit: true,
			resizable: true
		},
		{
			headerName: translateService.instant('CONFIG_HUB.NEW_VALUE'),
			field: 'targetValue',
			sortable: true,
			suppressSizeToFit: true,
			resizable: true,
			editable,
			cellRenderer: IconCellComponent,
			cellRendererParams: {
				iconName: IconCellIcons.pencil,
				useText: true,
				editable
			}
		},
		{
			headerName: translateService.instant('CONFIG_HUB.ENABLED'),
			field: 'enabled',
			sortable: false,
			resizable: false,
			cellRenderer: ToggleCellComponent,
			cellRendererParams: {
				toggleControl,
				editable
			}
		}
	];
};

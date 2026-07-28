/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { DatePipe } from '@angular/common';

import { SlptColDef } from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { ModalConfig } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { NotificationType } from '@acme-priv/armada-angular/src/acme/angular/components/notification-header';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubDraftJob } from '../../shared/models';

/**
 * Column definitions for the Drafts grid.
 * @param translateService - The translate service.
 * @param datePipe - DatePipe used to format dates.
 * @returns {SlptColDef[]}
 */
export const getJobsGridColumnDefs = (translateService: TranslateService, datePipe: DatePipe): SlptColDef[] => {
	return [
		{
			headerName: translateService.instant('CONFIG_HUB.NAME'),
			field: 'name',
			sortable: false
		},
		{
			headerName: translateService.instant('CONFIG_HUB.CREATION_DATE_TIME'),
			colId: 'createdTimestamp',
			valueGetter: params => {
				const data = <ConfigHubDraftJob>params.data;
				return datePipe.transform(data.created, 'medium');
			},
			comparator: (_a, _b, nodeA, nodeB) => {
				return new Date(nodeA.data.created).getTime() - new Date(nodeB.data.created).getTime();
			},
			sortable: false,
			sort: 'desc'
		},
		{
			headerName: translateService.instant('CONFIG_HUB.CREATED_BY'),
			field: 'requesterName',
			sortable: false
		},
		{
			headerName: translateService.instant('CONFIG_HUB.SOURCE_TENANT'),
			field: 'sourceTenant',
			sortable: false
		},
		{
			headerName: translateService.instant('CONFIG_HUB.SOURCE_BACKUP_NAME'),
			field: 'sourceBackupName',
			sortable: false
		}
	];
};

/**
 * Returns modal configuration for deleting a draft.
 * @param draftName - name of the draft to be deleted.
 * @returns {ModalConfig} configuration to be opened by the ModalService.
 */
export function getDeleteDraftModalConfig(name: string): ModalConfig {
	return {
		title: {
			translateKey: 'CONFIG_HUB.DELETE_DRAFT',
			translateParams: { name }
		},
		message: 'CONFIG_HUB.THIS_DRAFT_WILL_BE_PERMANENTLY_DELETED',
		type: NotificationType.Warning,
		footer: [
			{ label: 'CONFIG_HUB.DELETE', value: true, type: 'primary' },
			{ label: 'CONFIG_HUB.CANCEL', value: false, type: 'secondary' }
		],
		verticallyCentered: false
	};
}

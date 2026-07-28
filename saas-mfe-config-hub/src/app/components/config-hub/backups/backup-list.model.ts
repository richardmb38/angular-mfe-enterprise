/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { DatePipe } from '@angular/common';

import { GridOptions } from 'ag-grid-community';
import { Subject } from 'rxjs';

import { AlertConfig } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import {
	DataGridLoadingComponent,
	DataGridNoDataComponent,
	SlptColDef
} from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { ModalConfig } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { NotificationType } from '@acme-priv/armada-angular/src/acme/angular/components/notification-header';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import {
	ConfigHubBackupJob,
	ConfigHubBackupType,
	ConfigHubJobStatus,
	IncludedNames,
	JOB_ALERT_DURATION
} from '../shared/models';
import { BackupNameCellComponent } from './backup-name-cell/backup-name-cell.component';
import { DateTimeCreatedCellComponent } from './date-time-created-cell/date-time-created-cell.component';

/**
 * Get the first backup with status `COMPLETE`. Since backups list is already
 * sorted, the first one means the latest one according its completed date.
 * @param postSortParams - params including **sorted** backup row list.
 * @returns backup job in case it exists, otherwise undefined.
 */
export function getLatestCompletedBackupJobId(items: ConfigHubBackupJob[]): string {
	const latestCompletedBackupNode = items.reduce((a, b) => (a?.completed > b?.completed ? a : b), null);
	return latestCompletedBackupNode?.jobId ?? null;
}

/**
 * Column definitions for the Backups grid.
 * @param translateService - The translate service.
 * @param datePipe - DatePipe used to format dates.
 * @param latestBackupJobId$ - An observable containing the latest backup
 * @returns {SlptColDef[]}
 */
export const getJobsGridColumnDefs = (
	translateService: TranslateService,
	datePipe: DatePipe,
	latestCompletedJobId$: Subject<string>
): SlptColDef[] => {
	return [
		{
			headerName: translateService.instant('CONFIG_HUB.NAME'),
			colId: 'name',
			cellRenderer: BackupNameCellComponent,
			sortable: true,
			comparator: (_a, _b, nodeA, nodeB) => {
				const nameA = nodeA?.data?.name;
				const nameB = nodeB?.data?.name;
				if (nameA === nameB) {
					return 0;
				}
				return nameA > nameB ? 1 : -1;
			}
		},
		{
			headerName: translateService.instant('CONFIG_HUB.CREATION_DATE_TIME'),
			colId: 'completedTimestamp',
			cellRenderer: DateTimeCreatedCellComponent,
			cellRendererParams: {
				latestCompletedJobId$: latestCompletedJobId$
			},
			valueGetter: params => {
				const data = <ConfigHubBackupJob>params.data;
				return datePipe.transform(data.completed, 'medium');
			},
			comparator: (_a, _b, nodeA, nodeB) => {
				return new Date(nodeA.data.completed).getTime() - new Date(nodeB.data.completed).getTime();
			},
			sortable: true,
			sort: 'desc'
		},
		{
			headerName: translateService.instant('CONFIG_HUB.CREATED_BY'),
			field: 'requesterName',
			sortable: true
		}
	];
};

/**
 * Column definitions for the Uploaded Backups grid.
 * @param translateService - The translate service.
 * @param datePipe - DatePipe used to format dates.
 * @param latestBackupJobId$ - An observable containing the latest backup
 * @returns {SlptColDef[]}
 */
export const getUploadedJobsGridColumnDefs = (
	translateService: TranslateService,
	datePipe: DatePipe,
	latestCompletedJobId$: Subject<string>
): SlptColDef[] => {
	return [
		{
			headerName: translateService.instant('CONFIG_HUB.NAME'),
			colId: 'BackupName',
			field: 'name',
			sortable: false
		},
		{
			headerName: translateService.instant('CONFIG_HUB.CREATION_DATE_TIME'),
			colId: 'completedTimestamp',
			cellRenderer: DateTimeCreatedCellComponent,
			cellRendererParams: {
				latestCompletedJobId$: latestCompletedJobId$
			},
			valueGetter: params => {
				const data = <ConfigHubBackupJob>params.data;
				return datePipe.transform(data.completed, 'medium');
			},
			comparator: (_a, _b, nodeA, nodeB) => {
				return new Date(nodeA.data.completed).getTime() - new Date(nodeB.data.completed).getTime();
			},
			sortable: true,
			sort: 'desc'
		},
		{
			headerName: translateService.instant('CONFIG_HUB.CREATED_BY'),
			field: 'requesterName',
			sortable: true
		}
	];
};

/**
 * The options for the grid.
 */
export const jobsGridOptions: GridOptions = {
	getRowId: data => data?.data?.jobId,
	suppressMovableColumns: true,
	enableBrowserTooltips: true,
	suppressMultiSort: true,
	suppressColumnVirtualisation: true,
	colResizeDefault: 'shift',
	domLayout: 'normal',
	components: {
		customLoadingOverlay: DataGridLoadingComponent,
		customNoRowsOverlay: DataGridNoDataComponent
	}
};

/**
 * Record of job statuses and corresponding alert configurations.
 * @param backupJob - The job to get an AlertConfig for.
 * @param translateService - The translate service.
 * @param datePipe - DatePipe used to format dates.
 * @returns {Partial<Record<ConfigHubJobStatus, AlertConfig>>}
 */
export const getBackupJobAlertConfigs = (
	backupJob: ConfigHubBackupJob,
	translateService: TranslateService,
	datePipe: DatePipe
): Partial<Record<ConfigHubJobStatus, AlertConfig>> => {
	const FAILED_ERROR_MESSAGE = 'CONFIG_HUB.UPLOADING_BACKUP_ERROR' + ': ' + backupJob.message;
	return {
		COMPLETE: {
			id: ConfigHubJobStatus.COMPLETE,
			title:
				backupJob.backupType === ConfigHubBackupType.UPLOADED
					? 'CONFIG_HUB.UPLOADED_BACKUP_COMPLETE'
					: 'CONFIG_HUB.MANUAL_BACKUP_COMPLETE',
			html: translateService.instantSafeHtml({
				translateKey:
					backupJob.backupType === ConfigHubBackupType.UPLOADED
						? 'CONFIG_HUB.UPLOADED_BACKUP_COMPLETE_DETAILS'
						: 'CONFIG_HUB.MANUAL_BACKUP_COMPLETE_DETAILS',
				translateParams: {
					name: backupJob.name,
					timestamp: datePipe.transform(backupJob.completed, 'medium')
				}
			}),
			align: 'top',
			popup: true,
			type: NotificationType.Success,
			dismissible: true,
			duration: JOB_ALERT_DURATION
		},
		FAILED: {
			id: ConfigHubJobStatus.FAILED,
			title:
				backupJob.backupType === ConfigHubBackupType.UPLOADED
					? FAILED_ERROR_MESSAGE
					: 'CONFIG_HUB.MANUAL_BACKUP_ERROR',
			align: 'top',
			popup: true,
			type: NotificationType.Error,
			dismissible: true,
			duration: JOB_ALERT_DURATION
		},
		FAILED_EXTERNAL_COMMUNICATION: {
			id: ConfigHubJobStatus.FAILED_EXTERNAL_COMMUNICATION,
			title: 'CONFIG_HUB.ERROR_CREATING_BACKUP_EXTERNAL_COMMUNICATION',
			align: 'top',
			popup: true,
			type: NotificationType.Error,
			dismissible: true,
			duration: JOB_ALERT_DURATION
		},
		IN_PROGRESS: {
			id: ConfigHubJobStatus.IN_PROGRESS,
			title:
				backupJob.backupType === ConfigHubBackupType.UPLOADED
					? 'CONFIG_HUB.UPLOAD_IN_PROGRESS'
					: 'CONFIG_HUB.BACKUP_IN_PROGRESS',
			html: translateService.instantSafeHtml({
				translateKey:
					backupJob.backupType === ConfigHubBackupType.UPLOADED
						? 'CONFIG_HUB.YOUR_CONFIGURATION_UPLOAD_BACKUP_HAS_BEGUN'
						: 'CONFIG_HUB.YOUR_CONFIGURATION_BACKUP_HAS_BEGUN'
			}),
			align: 'top',
			popup: true,
			type: NotificationType.Loading
		}
	};
};

/**
 * Returns modal configuration for deleting a backup.
 * @param backupName - name of the backup to be deleted.
 * @returns {ModalConfig} configuration to be opened by the ModalService.
 */
export function getDeleteBackupModalConfig(backupName: string, isUploaded?: boolean): ModalConfig {
	return {
		title: {
			translateKey: isUploaded ? 'CONFIG_HUB.DELETE_UPLOADED_BACKUP' : 'CONFIG_HUB.DELETE_BACKUP',
			translateParams: { backupName }
		},
		message: 'CONFIG_HUB.THIS_BACKUP_WILL_BE_PERMANENTLY_DELETED',
		type: NotificationType.Warning,
		footer: [
			{ label: 'CONFIG_HUB.DELETE', value: true, type: 'primary' },
			{ label: 'CONFIG_HUB.CANCEL', value: false, type: 'secondary' }
		],
		verticallyCentered: false
	};
}

/**
 * Gets an AlertConfig indicating a successful backup deletion.
 *
 * @param name - name of the deleted backup.
 * @param translateService - provides the translateService for html translation.
 * @returns - Alert config indicating that the delete operation was successful.
 */
export function getDeleteBackupSuccessAlertConfig(
	name: string,
	translateService: TranslateService,
	translateKey: string
): AlertConfig {
	return {
		html: translateService.instantSafeHtml({
			translateKey: translateKey,
			translateParams: { name }
		}),
		type: NotificationType.Success,
		dismissible: true,
		duration: 4000,
		align: 'top',
		popup: true
	};
}

/**
 * Gets an AlertConfig indicating a limit on uploaded backup has been reached
 *
 * @param translateService - provides the translateService for html translation.
 * @param translateKey - provides the key used to retrive the message.
 * @returns - Alert config indicating that the upload limit has been reached.
 */
export function getUploadedBackupLimitWarning(translateService: TranslateService, translateKey: string): AlertConfig {
	return {
		html: translateService.instantSafeHtml({
			translateKey: translateKey
		}),
		type: NotificationType.Warning,
		dismissible: true,
		duration: 4000,
		align: 'top',
		popup: true
	};
}

/**
 * Gets an AlertConfig indicating the max number of backups was reached.
 *
 * @param limit - limit of backups allowed.
 * @param translateService - provides the translateService for html translation.
 * @returns - Alert config indicating that max number of backups was reached.
 */
export function getBackupsLimitReachedAlertConfig(limit: number, translateService: TranslateService): AlertConfig {
	return {
		title: 'CONFIG_HUB.BACKUP_LIMIT_REACHED',
		html: translateService.instantSafeHtml({
			translateKey: 'CONFIG_HUB.YOU_CAN_RETAIN_UP_TO_X_MANUAL_BACKUPS',
			translateParams: { limit }
		}),
		type: NotificationType.Error,
		dismissible: true,
		duration: 5000,
		align: 'top',
		popup: true
	};
}

export interface BackupOverlayResult {
	backupName?: string;
	selectedObjectTypes: string[];
	options?: Map<string, IncludedNames>;
	isPartialBackup: boolean;
}

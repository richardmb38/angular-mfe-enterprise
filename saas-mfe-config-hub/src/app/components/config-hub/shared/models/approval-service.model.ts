/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { AlertConfig } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import { NotificationType } from '@acme-priv/armada-angular/src/acme/angular/components/notification-header';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

/**
 * Gets an AlertConfig indicating that an approval was succesful
 *
 * @param translateService - provides the translateService for html translation.
 * @returns - Alert config indicating that cloud storage config was found.
 */
export function getApprovalConfirmation(translateService: TranslateService): AlertConfig {
	return {
		title: 'CONFIG_HUB.SUCCESS',
		html: translateService.instantSafeHtml({
			translateKey: 'CONFIG_HUB.YOUR_REQUEST_HAS_BEEN_SUBMITTED'
		}),
		type: NotificationType.Success,
		dismissible: true,
		duration: 5000,
		align: 'top',
		popup: true
	};
}

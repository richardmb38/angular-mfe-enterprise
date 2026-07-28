import { AlertConfig } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import { NotificationType } from '@acme-priv/armada-angular/src/acme/angular/components/notification-header';

/**
 * Gets an AlertConfig indicating that the draft approvals setting was enabled.
 */
export function getDraftApprovalSettingsEnabledAlert(): AlertConfig {
	return {
		title: 'Draft approvals enabled successfully', // TODO: Update translations
		type: NotificationType.Success,
		dismissible: true,
		duration: 5000,
		align: 'top',
		popup: true
	};
}

/**
 * Gets an AlertConfig indicating that the draft approvals setting was disabled.
 */
export function getDraftApprovalSettingsDisabledAlert(): AlertConfig {
	return {
		title: 'Draft approvals disabled successfully', // TODO: Update translations
		type: NotificationType.Success,
		dismissible: true,
		duration: 5000,
		align: 'top',
		popup: true
	};
}

/**
 * Gets an AlertConfig indicating that the draft approvals setting was enabled.
 */
export function getDraftApprovalSettingsErrorAlert(): AlertConfig {
	return {
		title: 'An error ocurred while updating this setting', // TODO: Update translations
		type: NotificationType.Error,
		dismissible: true,
		duration: 5000,
		align: 'top',
		popup: true
	};
}

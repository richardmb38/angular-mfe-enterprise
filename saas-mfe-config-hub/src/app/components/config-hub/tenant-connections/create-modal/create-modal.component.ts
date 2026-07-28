import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

import { Store } from '@ngrx/store';
import { Observable, debounceTime, distinctUntilChanged, of, switchMap, take } from 'rxjs';

import { AlertService } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import { FieldValidators } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { zIndexMap } from '@acme-priv/armada-angular/src/acme/theme/typescript';

import { fromTenantConnections } from '../store/selectors';

import {
	ConfigHubTenantConnection,
	CreateTenantConnectionParams,
	getTenantConnectionsAlertConfigs
} from '../../shared/models';
import { ConfigHubTenantConnectionsService } from '../../shared/services';

@Component({
	selector: 'app-create-tenant-connection-modal',
	templateUrl: './create-modal.component.html',
	styleUrls: ['./create-modal.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateTenantConnectionModalComponent implements OnInit {
	/**
	 * Setting modal z-index
	 */
	public backdropZIndex = zIndexMap.overlay;

	/**
	 * Readonly var for source max length
	 */
	public readonly TENANT_CONNECTION_JOB_SOURCE_MAX_LENGTH = 50;

	/**
	 * Readonly var for secret max length
	 */
	public readonly TENANT_CONNECTION_JOB_SECRET_MAX_LENGTH = 64;

	/**
	 * Readonly var for client max length
	 */
	public readonly TENANT_CONNECTION_JOB_CLIENT_ID_MAX_LENGTH = 32;

	/**
	 * Tenant connection form group
	 */
	public createTenantConnectionForm: UntypedFormGroup;

	/**
	 * Emits an event when the user tries to submit the form.
	 */
	public submitAttempted = new EventEmitter<void>();

	/**
	 * Loading State for loading mask
	 */
	public loading = false;

	/**
	 * Current Tenant Connections
	 */
	public tenantConnections$ = this.store.select(fromTenantConnections.getTenantConnectionsSelectors().selectAll);

	/**
	 * Emits an event when the modal is dismissed.
	 */
	@Output() onDismiss = new EventEmitter<ConfigHubTenantConnection>();

	constructor(
		private formBuilder: UntypedFormBuilder,
		private configHubTenantConnectionsService: ConfigHubTenantConnectionsService,
		private alertService: AlertService,
		private translateService: TranslateService,
		private store: Store
	) {}

	/**
	 * Modal Component
	 */
	ngOnInit(): void {
		this.createTenantConnectionForm = this.formBuilder.group({
			tenantSource: [
				'',
				[],
				[
					this.requiredValidator,
					(formControl: AbstractControl) =>
						FieldValidators.enforceMaxLength(formControl, this.TENANT_CONNECTION_JOB_SOURCE_MAX_LENGTH),
					(formControl: AbstractControl) => this.uniqueTenantValidator(formControl)
				]
			],
			tenantSecret: [
				'',
				[],
				[
					this.requiredValidator,
					(formControl: AbstractControl) =>
						FieldValidators.enforceMaxLength(formControl, this.TENANT_CONNECTION_JOB_SECRET_MAX_LENGTH)
				]
			],
			tenantClientId: [
				'',
				[],
				[
					this.requiredValidator,
					(formControl: AbstractControl) =>
						FieldValidators.enforceMaxLength(formControl, this.TENANT_CONNECTION_JOB_CLIENT_ID_MAX_LENGTH)
				]
			]
		});
	}

	/**
	 * Close modal
	 * @param newConnectionParams payload to create a new connection
	 */
	public handleDismiss(newConnectionParams?: CreateTenantConnectionParams): void {
		if (newConnectionParams) {
			this.createNewTenantConnection(newConnectionParams);
		} else {
			this.createTenantConnectionForm.reset();
			this.onDismiss.emit();
		}
	}

	/**
	 * Handles when the 'Create New' button is pressed
	 */
	public handleCreateTenantConnection(): void {
		this.submitAttempted.emit();

		if (this.createTenantConnectionForm.valid) {
			const formValue: CreateTenantConnectionParams = {
				sourceTenant: <string>this.createTenantConnectionForm.get('tenantSource').value,
				sourcePatClientId: <string>this.createTenantConnectionForm.get('tenantClientId').value,
				sourcePatClientSecret: <string>this.createTenantConnectionForm.get('tenantSecret').value
			};
			this.handleDismiss(formValue);
		}
	}

	/**
	 * Creates a new tenant connection
	 * @param newConnectionParams data required to create a new tenant connection
	 */
	public createNewTenantConnection(newConnectionParams?: CreateTenantConnectionParams): void {
		this.loading = true;
		this.configHubTenantConnectionsService
			.createNewTenantConnection(newConnectionParams)
			.pipe(take(1))
			.subscribe({
				next: (result: ConfigHubTenantConnection) => {
					this.loading = false;
					const alertConfigs = getTenantConnectionsAlertConfigs(this.translateService, result);
					this.createTenantConnectionForm.reset();
					this.alertService.open(alertConfigs.CREATE_CONNECTION_SUCCESS);
					this.onDismiss.emit(result);
				},
				error: () => {
					this.loading = false;
					this.createTenantConnectionForm.reset();
					this.onDismiss.emit();
				}
			});
	}

	/**
	 * Required tenant validator
	 * @param formControl AbstractControl
	 */
	private requiredValidator(formControl: AbstractControl): Promise<{
		[key: string]: any;
	}> {
		return formControl.dirty ? FieldValidators.required(formControl, 'CONFIG_HUB.REQUIRED') : new Promise(() => {});
	}

	/**
	 * Unique tenant validator
	 * @param control AbstractControl
	 */
	private uniqueTenantValidator(control: AbstractControl): Observable<{
		[key: string]: any;
	}> {
		return this.tenantConnections$.pipe(
			debounceTime(300),
			distinctUntilChanged(),
			take(1),
			switchMap(tenants => {
				const sourceTenants = tenants.map(tenant => tenant.sourceTenant);
				const sourceTenantInput = control?.value?.trim().toLowerCase();

				if (sourceTenants.includes(sourceTenantInput)) {
					return of({
						notUniqueSource: {
							message: 'CONFIG_HUB.TENANT_ALREADY_CONNECTED'
						}
					});
				}

				return of({});
			})
		);
	}
}

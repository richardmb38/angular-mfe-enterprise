/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject, map, take, takeUntil, tap } from 'rxjs';

import { TypeaheadOption } from '@acme-priv/armada-angular/src/acme/angular/components/form/input/typeahead';

import { UserRightsService } from '@acme-priv/ui-common/src/acme/angular/util/user-rights';

import { fromTenantConnections } from '../../tenant-connections/store/selectors';

import { ConfigHubRoles } from '../../shared/models/config-hub.model';
import { ConfigHubObjectMapping, ConfigHubObjectMappingOptions } from '../../shared/models/object-mapping.model';
import { ConfigHubConfigObjectsService } from '../../shared/services/config-objects/config-objects.service';
import { ConfigHubObjectMappingService } from '../../shared/services/object-mappings/object-mappings.service';

@Component({
	selector: 'app-object-mapping',
	templateUrl: './object-mapping.component.html',
	styleUrls: ['./object-mapping.component.scss']
})
export class ConfigHubObjectMappingComponent implements OnInit {
	/**
	 * Handles create new mapping overlay
	 */
	public showCreateNewMappingOverlay = false;

	/**
	 * Tenant connection mapped options
	 */
	public tenantConnectionOptions$: Observable<Array<ConfigHubObjectMappingOptions>>;

	/**
	 * List of object available in an org
	 */
	public objectMappingList: Array<ConfigHubObjectMapping> = [];

	/**
	 * Loading state
	 */
	public loading = false;

	/**
	 * Whether the tenant connection list is loading
	 */
	public loading$ = this.store.select(fromTenantConnections.getTenantConnectionsSelectors().selectIsLoading);

	/**
	 * The list of tenant connections for the current tenant
	 */
	private tenantConnections$ = this.store.select(fromTenantConnections.getTenantConnectionsSelectors().selectAll);

	/**
	 * Name of the currently selected tenant
	 */
	public selectedTenantName: string;

	/**
	 * Object types list
	 */
	public objectTypesList$ = new BehaviorSubject<Array<TypeaheadOption>>(null);

	/**
	 * Checks wether the user can create object mappings
	 */
	public canUserCreateObjectMapping$: Promise<boolean>;

	/**
	 * Unsubscribe subject
	 */
	private readonly unsubscribe$: Subject<void>;

	constructor(
		private store: Store,
		private configHubObjectMappingService: ConfigHubObjectMappingService,
		private configHubConfigObjectsService: ConfigHubConfigObjectsService,
		private changeDetector: ChangeDetectorRef,
		private userRightsService: UserRightsService
	) {
		this.unsubscribe$ = new Subject<void>();
		this.canUserCreateObjectMapping$ = this.userRightsService.hasRight(ConfigHubRoles.OBJECT_MAPPING_CREATE);
	}

	/**
	 * Initialization of the component
	 */
	ngOnInit(): void {
		this.mapTenantOptions();
		this.loadConfigObjects();
		this.setDefaultValue();
	}

	/**
	 * Handle create new object mapping
	 */
	public handleCreateNewObjectMapping(): void {
		this.showCreateNewMappingOverlay = true;
	}

	/**
	 * Hide mapping overlay
	 */
	public handleDetailsOverlayClose(): void {
		this.showCreateNewMappingOverlay = false;
	}

	/**
	 * Handles changes to the stored select field value
	 */
	public onSelectChange($event) {
		this.updateTenantConnectionList($event.value);
	}

	/**
	 * Updates object mapping list on create new
	 * @param createdData data passed from overlay
	 */
	public handleCreateNew(createdData: Array<ConfigHubObjectMapping>): void {
		this.objectMappingList = this.objectMappingList.concat(createdData);
	}

	/**
	 * Updates connections based on source tenant
	 */
	private updateTenantConnectionList(sourceTenant: string): void {
		this.loading = true;
		this.selectedTenantName = sourceTenant;
		this.configHubObjectMappingService
			.listObjectMappingsSourceOrg(sourceTenant)
			.pipe(take(1))
			.subscribe({
				next: objectMappingList => {
					this.objectMappingList = objectMappingList.items;
					this.loading = false;
					this.changeDetector.detectChanges();
				},
				error: () => {
					this.loading = false;
					this.changeDetector.detectChanges();
				}
			});
	}

	/**
	 * Maps to tenant options
	 */
	private mapTenantOptions(): void {
		this.tenantConnectionOptions$ = this.tenantConnections$.pipe(
			map(tenants =>
				tenants.map(({ sourceTenant }) => ({
					label: sourceTenant,
					value: sourceTenant,
					displayName: { untranslated: sourceTenant }
				}))
			),
			tap(tenants => {
				tenants.unshift({
					label: 'Default',
					value: 'default',
					displayName: { untranslated: 'Default' }
				});
			}),
			takeUntil(this.unsubscribe$)
		);
	}

	/**
	 * Retrieves the list of object types
	 */
	private loadConfigObjects(): void {
		this.configHubConfigObjectsService
			.getObjectTypes()
			.pipe(
				take(1),
				map(objectList =>
					objectList
						.sort((a, b) => (a.objectType > b.objectType ? 1 : -1))
						.map(item => ({
							displayName: item.objectType,
							raw: item
						}))
				)
			)
			.subscribe({
				next: list => {
					this.objectTypesList$.next(list);
				}
			});
	}

	/**
	 * Select default value
	 */
	private setDefaultValue(): void {
		this.tenantConnectionOptions$.pipe(take(1)).subscribe(tenants => {
			if (tenants[0]?.value) {
				this.updateTenantConnectionList(tenants[0].value);
			}
		});
	}
}

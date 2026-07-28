/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreModule } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { MemoizedAtomicStateSelectors } from '@acme-priv/ui-common/src/acme/angular/util';

import { fromTenantConnections } from '../../tenant-connections/store/selectors';

import { ConfigHubTenantConnection } from '../../shared/models';
import { mockConfigHubObjectMappingList } from '../../shared/models/object-mapping.mock';
import { ConfigHubObjectMapping } from '../../shared/models/object-mapping.model';
import { ConfigHubObjectMappingService } from '../../shared/services/object-mappings/object-mappings.service';
import { tenantConnectionsInitialState } from '../../tenant-connections/store/states';
import { ConfigHubObjectMappingComponent } from './object-mapping.component';

describe('ConfigHubObjectMappingComponent', () => {
	let component: ConfigHubObjectMappingComponent;
	let fixture: ComponentFixture<ConfigHubObjectMappingComponent>;
	let configHubObjectMappingService: ConfigHubObjectMappingService;
	beforeEach(async () => {
		jest.spyOn(fromTenantConnections, 'getTenantConnectionsSelectors').mockReturnValue({
			selectAll: () => [{ sourceTenant: 'test1' }, { sourceTenant: 'test2' }],
			selectIsLoading: () => true
		} as unknown as MemoizedAtomicStateSelectors<ConfigHubTenantConnection, object>);

		await TestBed.configureTestingModule({
			declarations: [ConfigHubObjectMappingComponent],
			imports: [StoreModule.forRoot([]), TranslateModule.forRoot(), HttpClientTestingModule],
			providers: [
				provideMockStore({
					initialState: tenantConnectionsInitialState
				})
			]
		}).compileComponents();
	});

	beforeEach(() => {
		TestBed.inject(MockStore);
		configHubObjectMappingService = TestBed.inject(ConfigHubObjectMappingService);
		fixture = TestBed.createComponent(ConfigHubObjectMappingComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('ngOnInit', () => {
		it('should have called mapTenantOptions', () => {
			const mapTenantOptionsSpy = jest.spyOn(component as any, 'mapTenantOptions');
			component.ngOnInit();
			expect(mapTenantOptionsSpy).toHaveBeenCalled();
		});

		it('should have called loadConfigObjects', () => {
			const loadConfigObjectsSpy = jest.spyOn(component as any, 'loadConfigObjects');
			component.ngOnInit();
			expect(loadConfigObjectsSpy).toHaveBeenCalled();
		});

		it('should have called setDefaultValue', () => {
			const setDefaultValueSpy = jest.spyOn(component as any, 'setDefaultValue');
			component.ngOnInit();
			expect(setDefaultValueSpy).toHaveBeenCalled();
		});
	});

	describe('handleCreateNewObjectMapping', () => {
		it('should toggle overlay flag', () => {
			component.handleCreateNewObjectMapping();
			expect(component.showCreateNewMappingOverlay).toBeTruthy();
		});
	});

	describe('handleDetailsOverlayClose', () => {
		it('should set mapping flag to false', () => {
			component.handleDetailsOverlayClose();
			expect(component.showCreateNewMappingOverlay).toBeFalsy();
		});
	});

	describe('mapTenantOptions', () => {
		it('should map tenants properly', done => {
			(component as any).mapTenantOptions();
			component.tenantConnectionOptions$.subscribe(data => {
				expect(data.length).toEqual(3);
				done();
			});
		});
	});

	describe('onSelectChange', () => {
		it('should assign values to objectList and selectedTenantName', () => {
			jest.spyOn(configHubObjectMappingService, 'listObjectMappingsSourceOrg').mockReturnValue(
				of({ items: mockConfigHubObjectMappingList as ConfigHubObjectMapping[] } as any)
			);

			// initial value is first element
			expect(component.selectedTenantName).toBe('default');

			component.onSelectChange({ value: 'test-org' });

			expect(component.selectedTenantName).toBe('test-org');
			expect(component.objectMappingList).toEqual(mockConfigHubObjectMappingList);
		});
	});
});

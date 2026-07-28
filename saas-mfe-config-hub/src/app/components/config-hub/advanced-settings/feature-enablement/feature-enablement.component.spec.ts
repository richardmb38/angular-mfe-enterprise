/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { of } from 'rxjs';

import { AlertsToasterService } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import { ToggleModule } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import {
	TranslateModule,
	TranslateService
} from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { IsFalsyModule } from '@acme-priv/armada-angular/src/acme/angular/util/isFalsy';

import {
	CloudStorageInfoPatchableFields,
	ConfigHubPatchOperations,
	mockCloudStorageResponse
} from '../../shared/models';
import { getDraftApprovalSettingsEnabledAlert } from '../../shared/models/feature-enablement.model';
import { ConfigHubAdvancedSettingsApiService } from '../../shared/services/advanced-settings/advanced-settings.service';
import { ConfigHubFeatureEnablementComponent } from './feature-enablement.component';

const routerMock = {
	navigateByUrl: () => {}
};

describe('FeatureENablementComponent', () => {
	let component: ConfigHubFeatureEnablementComponent;
	let fixture: ComponentFixture<ConfigHubFeatureEnablementComponent>;
	let configHubAdvancedSettingsApiService: ConfigHubAdvancedSettingsApiService;
	let alertService: AlertsToasterService;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				TranslateModule.forRoot(),
				ToggleModule,
				RouterTestingModule,
				HttpClientTestingModule,
				IsFalsyModule
			],
			declarations: [ConfigHubFeatureEnablementComponent],
			providers: [TranslateService, FormBuilder, { provide: Router, useValue: routerMock }]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ConfigHubFeatureEnablementComponent);
		configHubAdvancedSettingsApiService = TestBed.inject(ConfigHubAdvancedSettingsApiService);
		alertService = TestBed.inject(AlertsToasterService);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('ngOnInit', () => {
		it('should fetch approvals setting', fakeAsync(() => {
			component.canUserEditSettings$ = Promise.resolve(true);
			jest.spyOn(component['featureFlagService'], 'isEnabled').mockReturnValue(true);
			jest.spyOn(component['userRightsService'], 'hasRight').mockResolvedValue(true);

			const fetchApprovalsIsEnabledSpy = jest.spyOn(component, 'fetchApprovalsIsEnabled');

			component.ngOnInit();

			tick();

			expect(fetchApprovalsIsEnabledSpy).toHaveBeenCalled();
		}));
	});

	describe('fetchApprovalsIsEnabled', () => {
		it('should set approvalsEnabled setting', fakeAsync(() => {
			jest.spyOn(configHubAdvancedSettingsApiService, 'getIsApprovalsSettingEnabled').mockReturnValue(of(true));
			component['isApprovalsFeatureFlagEnabled'] = true;

			component.fetchApprovalsIsEnabled();

			tick();

			expect(component.approvalsIsEnabled).toBeTruthy();
		}));
	});

	describe('getPatchOperationPayload', () => {
		it('should return a valid PATCH payload', () => {
			const payload = (component as any).getPatchOperationPayload(
				CloudStorageInfoPatchableFields.APPROVALS_ENABLED,
				true
			);
			expect(payload).toEqual([
				{
					op: ConfigHubPatchOperations.REPLACE,
					path: '/approvalsEnabled',
					value: true
				}
			]);
		});
	});

	describe('patchCloudStorage', () => {
		it('should show an alert when toggle is changed', fakeAsync(() => {
			jest.spyOn(configHubAdvancedSettingsApiService, 'patchCloudStorage').mockReturnValue(
				of(mockCloudStorageResponse)
			);

			component.approvalsIsEnabled = false;

			const alertServiceSpy = jest.spyOn(alertService, 'open');

			(component as any).patchCloudStorage('approvalsEnabled', true);

			tick();

			expect(component.approvalsIsEnabled).toBeTruthy();
			expect(alertServiceSpy).toHaveBeenCalledWith(getDraftApprovalSettingsEnabledAlert());
		}));
	});

	describe('handleToggleChange', () => {
		it('should trigger patchCloudStorage', () => {
			const patchCloudStorageSpy = jest.spyOn(component as any, 'patchCloudStorage');

			component.handleToggleChange(true);

			expect(patchCloudStorageSpy).toHaveBeenCalledWith(CloudStorageInfoPatchableFields.APPROVALS_ENABLED, true);
		});
	});
});

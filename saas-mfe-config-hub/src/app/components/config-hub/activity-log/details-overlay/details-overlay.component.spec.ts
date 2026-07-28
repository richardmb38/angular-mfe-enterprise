/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateLoader } from '@ngx-translate/core';

import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { TranslateStaticLoader } from '@acme-priv/armada-angular/src/acme/angular/l10n/translate-static-loader';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubDeployJob, ConfigHubDeployResults, mockObjectImportResult } from '../../shared/models';
import { ConfigHubActivityLogTabs } from '../activity-log.model';
import { ConfigHubDetailsOverlayComponent } from './details-overlay.component';

describe('ConfigHubDetailsOverlayComponent', () => {
	let component: ConfigHubDetailsOverlayComponent;
	let fixture: ComponentFixture<ConfigHubDetailsOverlayComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfigHubDetailsOverlayComponent],
			imports: [
				TranslateModule.forRoot({
					loader: {
						provide: TranslateLoader,
						useClass: TranslateStaticLoader
					}
				}),
				HttpClientTestingModule,
				NoopAnimationsModule,
				LoadingMaskModule
			],
			providers: [FormBuilder],
			schemas: [CUSTOM_ELEMENTS_SCHEMA]
		}).compileComponents();

		fixture = TestBed.createComponent(ConfigHubDetailsOverlayComponent);
		component = fixture.componentInstance;
		component.selectedDetails = {} as ConfigHubDeployJob;
		component.downloadResults = {} as ConfigHubDeployResults;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('init form values', () => {
		it('should call initObjectDetailsForm', () => {
			const initObjectDetailsFormSpy = jest.spyOn(component as any, 'initObjectDetailsForm');
			component.ngOnInit();

			expect(component.objectDetailsForm.value['objectJson']).toEqual('');
			expect(initObjectDetailsFormSpy).toHaveBeenCalled();
		});
	});

	describe('updateObjectDetailsForm', () => {
		it('should update form values', () => {
			const updateObjectDetailsFormSpy = jest.spyOn(component as any, 'updateObjectDetailsForm');
			const results = {
				SOURCE: mockObjectImportResult
			};
			(component as any).updateObjectDetailsForm('objectJson', results);
			expect(component.objectDetailsForm.value['objectJson']).toEqual(JSON.stringify([{ results }], null, 2));
			expect(updateObjectDetailsFormSpy).toHaveBeenCalled();
		});
	});

	describe('ngOnInit', () => {
		it('should call setTabs', () => {
			const setTabsSpy = jest.spyOn(component as any, 'setTabs');
			component.ngOnInit();
			expect(setTabsSpy).toHaveBeenCalled();
			expect(component.tabs.length).toEqual(2);
		});
	});

	describe('ngOnDestroy', () => {
		it('should complete unsubscribe$ subject', () => {
			const nextSpy = jest.spyOn((component as any).unsubscribe$, 'next');
			const completeSpy = jest.spyOn((component as any).unsubscribe$, 'complete');

			component.ngOnDestroy();
			expect(nextSpy).toHaveBeenCalled();
			expect(completeSpy).toHaveBeenCalled();
		});
	});

	describe('handleDismiss', () => {
		it('should emit an onDismiss event when called', fakeAsync(() => {
			const onDismissSpy = jest.spyOn(component.onDismiss, 'emit');

			component.handleDismiss();
			tick();

			expect(onDismissSpy).toHaveBeenCalled();
		}));
	});

	describe('handleTabClick', () => {
		it('should set the new value tab', () => {
			const loadDraftResultsApiSpy = jest.spyOn(component as any, 'loadDraftDownloadResults');
			expect(component.currentTab).toEqual(ConfigHubActivityLogTabs.DEPLOYMENT_LOG);
			component.handleTabClick(ConfigHubActivityLogTabs.DEPLOYMENT_DRAFT);
			expect(component.currentTab).toEqual(ConfigHubActivityLogTabs.DEPLOYMENT_DRAFT);
			expect(loadDraftResultsApiSpy).toHaveBeenCalled();
		});
	});

	describe('getTabIndex', () => {
		it('should get the tab array position not the tab index', () => {
			const tabIndex = component.getTabIndex(ConfigHubActivityLogTabs.DEPLOYMENT_DRAFT);
			expect(tabIndex).toBe(1);
		});
	});
});

/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AbstractControl, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { of, throwError } from 'rxjs';

import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { IncludedNames, mockConfigHubObjectTypes } from '../../shared/models';
import { ConfigHubConfigObjectsService } from '../../shared/services/config-objects/config-objects.service';
import { ConfigHubCreateBackupOverlayComponent } from './create-backup-overlay.component';

describe('CreateBackupOverlayComponent', () => {
	let component: ConfigHubCreateBackupOverlayComponent;
	let fixture: ComponentFixture<ConfigHubCreateBackupOverlayComponent>;
	let configObjectsService: ConfigHubConfigObjectsService;
	let modalService: ModalService;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfigHubCreateBackupOverlayComponent],
			imports: [
				TranslateModule.forRoot(),
				HttpClientTestingModule,
				LoadingMaskModule,
				NoopAnimationsModule,
				ReactiveFormsModule
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
			providers: [FormBuilder]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ConfigHubCreateBackupOverlayComponent);
		configObjectsService = TestBed.inject(ConfigHubConfigObjectsService);
		modalService = TestBed.inject(ModalService);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('ngOnInit', () => {
		it('should call loadBackupObjects', () => {
			const loadBackupObjectsSpy = jest.spyOn(component as any, 'loadBackupObjects');
			component.ngOnInit();
			expect(loadBackupObjectsSpy).toHaveBeenCalled();
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
		it('should emit an onClose event when called', () => {
			component.backupObjectList = [{ objectType: 'AN_OBJECT_TYPE' }];
			const onCloseSpy = jest.spyOn(component.onDismiss, 'emit');

			component.handleDismiss();
			expect(onCloseSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('handleCreateBackup', () => {
		it('should call handleDismiss with a valid backup name and object types are selected', async () => {
			jest.spyOn(component as any, 'validateSelectedOptions').mockReturnValue(Promise.resolve(true));
			await component.ngOnInit();
			component.backupObjectList = [{ objectType: 'AN_OBJECT_TYPE' }];
			component.selectedObjectTypes = ['AN_OBJECT_TYPE'];
			const backupNameControl = component.createBackupForm.get('backupName') as AbstractControl;
			await backupNameControl.patchValue('a test name');

			const handleDismissSpy = jest.spyOn(component, 'handleDismiss');

			await component.handleCreateBackup();

			expect(handleDismissSpy).toHaveBeenCalledWith('a test name');
		});

		it('should not call handleDismiss with an invalid backup name', fakeAsync(() => {
			component.ngOnInit();
			component.selectedObjectTypes = ['AN_OBJECT_TYPE'];
			const backupNameControl = component.createBackupForm.get('backupName') as AbstractControl;
			backupNameControl.patchValue('');
			tick();

			const handleDismissSpy = jest.spyOn(component, 'handleDismiss');

			component.handleCreateBackup();
			expect(handleDismissSpy).not.toHaveBeenCalled();
		}));

		it('should not call handleDismiss when object types are not selected', fakeAsync(() => {
			component.ngOnInit();
			component.backupObjectList = [];
			const backupNameControl = component.createBackupForm.get('backupName') as AbstractControl;
			backupNameControl.patchValue('a test name');
			tick();

			const handleDismissSpy = jest.spyOn(component, 'handleDismiss');

			component.handleCreateBackup();
			expect(handleDismissSpy).not.toHaveBeenCalled();
		}));
	});

	describe('loadBackupObjects', () => {
		it('should set the backupObjectList', () => {
			jest.spyOn(configObjectsService, 'getObjectTypes').mockReturnValue(of(mockConfigHubObjectTypes));
			const filteredObjects = mockConfigHubObjectTypes.filter(object => !!object.exportUrl);
			(component as any).loadBackupObjects();
			expect(component.loading).toBe(false);
			expect(component.backupObjectList).toStrictEqual(filteredObjects);
		});

		it('should handle service error', () => {
			jest.spyOn(configObjectsService, 'getObjectTypes').mockReturnValue(throwError(() => 'error'));
			(component as any).loadBackupObjects();
			expect(component.loading).toBe(false);
			expect(component.backupObjectList).toEqual(undefined);
		});
	});

	describe('getFilteredOptionsBySelected', () => {
		it('should filter object options to only selected ones', () => {
			component.selectedObjectTypes = ['SOURCE'];
			component.objectOptions = new Map([
				[
					'SOURCE',
					{
						includedNames: ['TEST']
					}
				],
				[
					'OTHER',
					{
						includedNames: []
					}
				]
			]);
			const filteredData = (component as any).getFilteredOptionsBySelected();
			expect(filteredData.size).toEqual(1);
		});

		it('should return empty options when no names included', () => {
			component.selectedObjectTypes = ['OTHER'];
			component.objectOptions = new Map([
				[
					'SOURCE',
					{
						includedNames: []
					}
				],
				[
					'OTHER',
					{
						includedNames: []
					}
				]
			]);
			const filteredData = (component as any).getFilteredOptionsBySelected();
			expect(filteredData.size).toEqual(0);
		});
	});

	describe('validateSelectedOptions', () => {
		it('should show a warning modal', () => {
			const objectOptionsMap = new Map<string, IncludedNames>();
			objectOptionsMap.set('some-type', { includedNames: ['some-name'] });
			component.objectOptions = objectOptionsMap;

			component.selectedObjectTypes = [];

			const modalServiceSpy = jest.spyOn(modalService, 'open');

			(component as any).validateSelectedOptions();

			expect(modalServiceSpy).toHaveBeenCalled();
		});

		it('should not show a warning modal', () => {
			const objectOptionsMap = new Map<string, IncludedNames>();
			objectOptionsMap.set('some-type', { includedNames: ['some-name'] });
			component.objectOptions = objectOptionsMap;

			component.selectedObjectTypes = ['some-type'];

			const modalServiceSpy = jest.spyOn(modalService, 'open');

			(component as any).validateSelectedOptions();

			expect(modalServiceSpy).not.toHaveBeenCalled();
		});
	});
});

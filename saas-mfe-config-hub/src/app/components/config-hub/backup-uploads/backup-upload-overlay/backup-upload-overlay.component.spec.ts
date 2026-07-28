/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ButtonModule } from '@acme-priv/armada-angular/src/acme/angular/components/button';
import {
	FileUploadFieldModule,
	FormModule
} from '@acme-priv/armada-angular/src/acme/angular/components/form';
import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { OverlayModule } from '@acme-priv/armada-angular/src/acme/angular/components/overlay';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubBackupsApiService } from '../../shared/services';
import { ConfigHubBackupUploadOverlayComponent } from './backup-upload-overlay.component';

describe('BackupUploadOverlayComponent', () => {
	let component: ConfigHubBackupUploadOverlayComponent;
	let fixture: ComponentFixture<ConfigHubBackupUploadOverlayComponent>;
	let backupsApiService: ConfigHubBackupsApiService;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfigHubBackupUploadOverlayComponent],
			providers: [FormBuilder],
			imports: [
				TranslateModule.forRoot(),
				OverlayModule,
				ButtonModule,
				FileUploadFieldModule,
				LoadingMaskModule,
				FormModule,
				HttpClientTestingModule,
				NoopAnimationsModule
			]
		}).compileComponents();

		backupsApiService = TestBed.inject(ConfigHubBackupsApiService);
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ConfigHubBackupUploadOverlayComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('ngOnInit', () => {
		it('should call initializeForm', () => {
			const initializeFormSpy = jest.spyOn(component as any, 'initializeForm');
			component.ngOnInit();

			expect(initializeFormSpy).toHaveBeenCalled();
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

	describe('handleSubmit', () => {
		it('should call upload backup if JSON file is valid and name is included', () => {
			const createBackupJobSpy = jest.spyOn(backupsApiService, 'uploadBackup');

			component.ngOnInit();
			component.backupFileUploadField?.setValue([
				{ file: new File([''], 'test.json', { type: 'application/json' }) }
			]);
			component.backupFileUploadField?.clearAsyncValidators();
			component.backupFileUploadField?.updateValueAndValidity();

			component.backupNameUploadField?.setValue('SOMENAME');
			component.backupNameUploadField?.clearAsyncValidators();
			component.backupNameUploadField?.updateValueAndValidity();

			component.handleSubmit();

			expect(createBackupJobSpy).toHaveBeenCalled();
		});

		it('should not call upload backup if JSON file is invalid', () => {
			const createBackupJobSpy = jest.spyOn(backupsApiService, 'uploadBackup');

			component.ngOnInit();
			component.backupFileUploadField?.setValue([{ file: new File([''], 'test.html', { type: 'text/html' }) }]);
			component.backupNameUploadField?.setValue('SOMENAME');
			component.backupNameUploadField?.clearAsyncValidators();
			component.backupNameUploadField?.updateValueAndValidity();

			component.handleSubmit();

			expect(createBackupJobSpy).not.toHaveBeenCalled();
		});

		it('should not call upload backup if JSON file is missing', () => {
			const createBackupJobSpy = jest.spyOn(backupsApiService, 'uploadBackup');

			component.ngOnInit();
			component.backupNameUploadField?.setValue('SOMENAME');
			component.backupNameUploadField?.clearAsyncValidators();
			component.backupNameUploadField?.updateValueAndValidity();

			component.handleSubmit();

			expect(createBackupJobSpy).not.toHaveBeenCalled();
		});
		it('should not call upload backup if JSON file size exceeds limit', () => {
			const createBackupJobSpy = jest.spyOn(backupsApiService, 'uploadBackup');

			component.ngOnInit();
			const mockedFile = new File([''], 'test.json', { type: 'application/json' });
			Object.defineProperty(mockedFile, 'size', { value: 50 * 1024 * 1024 + 1 });
			component.backupFileUploadField?.setValue([
				{ file: new File([''], 'test.json', { type: 'application/json' }) }
			]);
			component.backupNameUploadField?.setValue('SOMENAME');
			component.backupNameUploadField?.clearAsyncValidators();
			component.backupNameUploadField?.updateValueAndValidity();

			component.handleSubmit();

			expect(createBackupJobSpy).not.toHaveBeenCalled();
		});
	});
});

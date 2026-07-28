/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';

import { StoreModule } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { of, throwError } from 'rxjs';

import { AlertService } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import {
	CreateTenantConnectionParams,
	mockConfigHubTenantConnection,
	mockConfigHubTenantConnectionsList
} from '../../shared/models';
import { ConfigHubTenantConnectionsService } from '../../shared/services';
import { CreateTenantConnectionModalComponent } from './create-modal.component';

describe('CreateModalComponent', () => {
	let component: CreateTenantConnectionModalComponent;
	let fixture: ComponentFixture<CreateTenantConnectionModalComponent>;
	let tenantConnectionsService: ConfigHubTenantConnectionsService;
	let alertService: AlertService;

	const mockConnectionParams: CreateTenantConnectionParams = {
		sourcePatClientId: mockConfigHubTenantConnection.sourcePatClientId,
		sourcePatClientSecret: 'mock-secret',
		sourceTenant: mockConfigHubTenantConnection.sourceTenant
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CreateTenantConnectionModalComponent],
			imports: [HttpClientTestingModule, ReactiveFormsModule, TranslateModule.forRoot(), StoreModule.forRoot([])],
			providers: [DatePipe, provideMockStore()]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CreateTenantConnectionModalComponent);
		component = fixture.componentInstance;
		tenantConnectionsService = TestBed.inject(ConfigHubTenantConnectionsService);
		alertService = TestBed.inject(AlertService);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('handleDismiss', () => {
		it('should reset the form and dismiss when no parameters are passed', () => {
			const onDismissSpy = jest.spyOn(component.onDismiss, 'emit');

			component.ngOnInit();

			const tenantSourceControl = component.createTenantConnectionForm.get('tenantSource') as AbstractControl;
			const tenantClientIdControl = component.createTenantConnectionForm.get('tenantClientId') as AbstractControl;
			const tenantSecretControl = component.createTenantConnectionForm.get('tenantSecret') as AbstractControl;

			tenantSourceControl.patchValue(mockConnectionParams.sourceTenant);
			tenantClientIdControl.patchValue(mockConnectionParams.sourcePatClientId);
			tenantSecretControl.patchValue(mockConnectionParams.sourcePatClientSecret);

			component.handleDismiss();

			expect(tenantSourceControl.value).toBeNull();
			expect(tenantClientIdControl.value).toBeNull();
			expect(tenantSecretControl.value).toBeNull();

			expect(onDismissSpy).toHaveBeenCalledWith();
		});

		it('should call createNewTenantConnection when called with params', () => {
			const createNewTenantConnectionSpy = jest.spyOn(component, 'createNewTenantConnection');

			component.handleDismiss(mockConnectionParams);

			expect(createNewTenantConnectionSpy).toHaveBeenCalledWith(mockConnectionParams);
		});
	});

	describe('handleCreateTenantConnection', () => {
		it('should call handleDismiss with valid params', fakeAsync(done => {
			component.tenantConnections$ = of(mockConfigHubTenantConnectionsList);
			component.ngOnInit();
			const tenantSourceControl = component.createTenantConnectionForm.get('tenantSource') as AbstractControl;
			const tenantClientIdControl = component.createTenantConnectionForm.get('tenantClientId') as AbstractControl;
			const tenantSecretControl = component.createTenantConnectionForm.get('tenantSecret') as AbstractControl;

			tenantSourceControl.patchValue(mockConnectionParams.sourceTenant);
			tenantClientIdControl.patchValue(mockConnectionParams.sourcePatClientId);
			tenantSecretControl.patchValue(mockConnectionParams.sourcePatClientSecret);
			tick();

			const handleDismissSpy = jest.spyOn(component, 'handleDismiss');

			component.createTenantConnectionForm.valueChanges.pipe().subscribe(() => {
				component.handleCreateTenantConnection();
				expect(handleDismissSpy).toHaveBeenCalledWith(mockConnectionParams);
				done();
			});
		}));

		it('should not call handleDismiss if form is not valid', fakeAsync(done => {
			component.tenantConnections$ = of(mockConfigHubTenantConnectionsList);
			component.ngOnInit();
			const tenantSourceControl = component.createTenantConnectionForm.get('tenantSource') as AbstractControl;
			const tenantClientIdControl = component.createTenantConnectionForm.get('tenantClientId') as AbstractControl;
			const tenantSecretControl = component.createTenantConnectionForm.get('tenantSecret') as AbstractControl;

			tenantSourceControl.patchValue('');
			tenantClientIdControl.patchValue('');
			tenantSecretControl.patchValue('');
			tick();

			const handleDismissSpy = jest.spyOn(component, 'handleDismiss');

			component.createTenantConnectionForm.valueChanges.pipe().subscribe(() => {
				component.handleCreateTenantConnection();
				expect(handleDismissSpy).not.toHaveBeenCalled();
				done();
			});
		}));

		it('should not create connection cause of duplicate', fakeAsync(done => {
			component.tenantConnections$ = of(mockConfigHubTenantConnectionsList);
			component.ngOnInit();
			const tenantSourceControl = component.createTenantConnectionForm.get('tenantSource') as AbstractControl;
			const tenantClientIdControl = component.createTenantConnectionForm.get('tenantClientId') as AbstractControl;
			const tenantSecretControl = component.createTenantConnectionForm.get('tenantSecret') as AbstractControl;

			tenantSourceControl.patchValue('sourceTenant2');
			tenantClientIdControl.patchValue('23123');
			tenantSecretControl.patchValue('121212');
			tick();

			component.createTenantConnectionForm.valueChanges.pipe().subscribe(() => {
				component.handleCreateTenantConnection();
				expect(component.createTenantConnectionForm.invalid).toBe(true);
				done();
			});
		}));
	});

	describe('createNewTenantConnection', () => {
		it('Should show an alert, reset the form and dismiss with value when connection is created', () => {
			component.ngOnInit();
			jest.spyOn(tenantConnectionsService, 'createNewTenantConnection').mockReturnValue(
				of(mockConfigHubTenantConnection)
			);

			const onDismissSpy = jest.spyOn(component.onDismiss, 'emit');
			const alertSpy = jest.spyOn(alertService, 'open');
			const resetFormSpy = jest.spyOn(component.createTenantConnectionForm, 'reset');

			component.createNewTenantConnection(mockConnectionParams);

			expect(component.loading).toBeFalsy();
			expect(alertSpy).toHaveBeenCalled();
			expect(resetFormSpy).toHaveBeenCalled();
			expect(onDismissSpy).toHaveBeenCalledWith(mockConfigHubTenantConnection);
		});

		it('Should reset the form and dismiss the modal with no value', () => {
			component.ngOnInit();
			jest.spyOn(tenantConnectionsService, 'createNewTenantConnection').mockReturnValue(
				throwError(() => 'error')
			);

			const onDismissSpy = jest.spyOn(component.onDismiss, 'emit');
			const alertSpy = jest.spyOn(alertService, 'open');
			const resetFormSpy = jest.spyOn(component.createTenantConnectionForm, 'reset');

			component.createNewTenantConnection(mockConnectionParams);

			expect(component.loading).toBeFalsy();
			expect(alertSpy).not.toHaveBeenCalled();
			expect(resetFormSpy).toHaveBeenCalled();
			expect(onDismissSpy).toHaveBeenCalledWith();
		});
	});
});

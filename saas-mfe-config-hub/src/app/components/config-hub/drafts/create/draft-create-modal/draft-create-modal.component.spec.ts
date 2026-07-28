/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';

import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubDraftCreateModalComponent } from './draft-create-modal.component';

describe('DraftCreateModalComponent', () => {
	let component: ConfigHubDraftCreateModalComponent;
	let fixture: ComponentFixture<ConfigHubDraftCreateModalComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfigHubDraftCreateModalComponent],
			imports: [HttpClientTestingModule, ReactiveFormsModule, TranslateModule.forRoot()],
			providers: [DatePipe]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ConfigHubDraftCreateModalComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('default form value should contain source backup id', () => {
		component.sourceBackupId = '1234';
		component.ngOnInit();
		const draftNameControl = component.createDraftForm.get('draftName') as AbstractControl;

		expect(draftNameControl.value).toContain('1234');
	});

	describe('handleDismiss', () => {
		it('should reset the form', () => {
			component.ngOnInit();
			const draftNameControl = component.createDraftForm.get('draftName') as AbstractControl;
			draftNameControl.patchValue('a test name');

			component.handleDismiss();
			expect(draftNameControl.value).toBeNull();
		});

		it('should emit the name of the draft', () => {
			const onDismissSpy = jest.spyOn(component.onDismiss, 'emit');
			component.handleDismiss('a test name');
			expect(onDismissSpy).toHaveBeenCalledWith('a test name');
		});
	});

	describe('handleCreateDraft', () => {
		it('should call handleDismiss with a valid draft name', fakeAsync(() => {
			component.ngOnInit();
			const draftNameControl = component.createDraftForm.get('draftName') as AbstractControl;
			draftNameControl.patchValue('a test name');
			tick();

			const handleDismissSpy = jest.spyOn(component, 'handleDismiss');

			component.handleCreateDraft();
			expect(handleDismissSpy).toHaveBeenCalledWith('a test name');
		}));

		it('should not call handleDismiss with an invalid draft name', fakeAsync(() => {
			component.ngOnInit();
			const draftNameControl = component.createDraftForm.get('draftName') as AbstractControl;
			draftNameControl.patchValue('');
			tick();

			const handleDismissSpy = jest.spyOn(component, 'handleDismiss');

			component.handleCreateDraft();
			expect(handleDismissSpy).not.toHaveBeenCalled();
		}));
	});
});

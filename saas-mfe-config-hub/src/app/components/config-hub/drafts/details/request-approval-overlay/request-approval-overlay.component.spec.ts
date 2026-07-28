/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';

import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { RequestApprovalOverlayComponent } from './request-approval-overlay.component';

describe('RequestApprovalOverlayComponent', () => {
	let component: RequestApprovalOverlayComponent;
	let fixture: ComponentFixture<RequestApprovalOverlayComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [RequestApprovalOverlayComponent],
			imports: [HttpClientTestingModule, ReactiveFormsModule, TranslateModule.forRoot()],
			providers: [DatePipe]
		});
		fixture = TestBed.createComponent(RequestApprovalOverlayComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(RequestApprovalOverlayComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
	describe('handleDismiss', () => {
		it('should reset the form', () => {
			component.ngOnInit();
			const approvalCommentControl = component.createApprovalStatusForm.get('comment') as AbstractControl;
			approvalCommentControl.patchValue('a test comment');

			component.handleDismiss();
			expect(approvalCommentControl.value).toBeNull();
		});

		it('should emit the comment of the approval draft', () => {
			const onDismissSpy = jest.spyOn(component.onDismiss, 'emit');
			component.handleDismiss('a test comment');
			expect(onDismissSpy).toHaveBeenCalledWith('a test comment');
		});
	});

	describe('handleApproveDraft', () => {
		it('should call handleApproveDraft with a valid draft comment', fakeAsync(() => {
			component.ngOnInit();
			const draftNameControl = component.createApprovalStatusForm.get('comment') as AbstractControl;
			draftNameControl.patchValue('a test comment');
			tick();

			const handleDismissSpy = jest.spyOn(component, 'handleDismiss');

			component.handleApproveDraft();
			expect(handleDismissSpy).toHaveBeenCalledWith('a test comment');
		}));
	});
});

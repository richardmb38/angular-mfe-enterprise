/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { provideMockStore } from '@ngrx/store/testing';

import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { fromDraftsPage } from '../../store/selectors';

import { ConfigHubApprovalCommentsOverlayComponent } from './approval-comments-overlay.component';

describe('ApprovalCommentsOverlayComponent', () => {
	let component: ConfigHubApprovalCommentsOverlayComponent;
	let fixture: ComponentFixture<ConfigHubApprovalCommentsOverlayComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [ConfigHubApprovalCommentsOverlayComponent],
			imports: [TranslateModule.forRoot(), NoopAnimationsModule],
			providers: [
				provideMockStore({
					selectors: [
						{
							selector: fromDraftsPage.selectApprovalStatusComments,
							value: []
						}
					]
				})
			]
		});
		fixture = TestBed.createComponent(ConfigHubApprovalCommentsOverlayComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('handleDismiss', () => {
		it('should emit onDismiss event', () => {
			const emitSpy = jest.spyOn(component.onDismiss, 'emit');

			component.handleDismiss();

			expect(emitSpy).toHaveBeenCalled();
		});
	});
});

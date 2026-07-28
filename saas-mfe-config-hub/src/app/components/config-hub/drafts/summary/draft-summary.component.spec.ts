/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateLoader } from '@ngx-translate/core';

import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { TranslateStaticLoader } from '@acme-priv/armada-angular/src/acme/angular/l10n/translate-static-loader';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { draftsPageActions } from '../store/actions';

import { mockConfigHubDraftJob } from '../../shared/models';
import { draftsPageInitialState } from '../store/states';
import { ConfigHubDraftSummaryComponent } from './draft-summary.component';

const mockActivatedRoute = { snapshot: { params: { id: mockConfigHubDraftJob.jobId } } };

describe('ConfigHubDraftSummaryComponent', () => {
	let component: ConfigHubDraftSummaryComponent;
	let fixture: ComponentFixture<ConfigHubDraftSummaryComponent>;
	let mockStore: MockStore;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfigHubDraftSummaryComponent],
			imports: [
				StoreModule.forRoot([]),
				EffectsModule.forRoot([]),
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
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
			providers: [
				provideMockStore({
					initialState: draftsPageInitialState
				}),
				{ provide: ActivatedRoute, useValue: mockActivatedRoute },
				{
					provide: ModalService,
					useValue: { open: () => Promise.resolve() }
				}
			]
		}).compileComponents();

		mockStore = TestBed.inject(MockStore);
		fixture = TestBed.createComponent(ConfigHubDraftSummaryComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('ngOnInit', () => {
		it('should dispatch the summaryPageOpen action', () => {
			const dispatchSpy = jest.spyOn(mockStore, 'dispatch');

			component.ngOnInit();

			expect(dispatchSpy).toHaveBeenCalledWith(
				draftsPageActions.summaryPageOpen({ draftId: mockConfigHubDraftJob.jobId })
			);
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
});

/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule, createSelector } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateLoader } from '@ngx-translate/core';
import { take } from 'rxjs';

import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { TranslateStaticLoader } from '@acme-priv/armada-angular/src/acme/angular/l10n/translate-static-loader';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { draftsPageActions } from '../store/actions';
import { fromDraftsPage } from '../store/selectors';

import { ObjectDeltaTypeNames, ObjectOperationType } from '../../shared/models';
import { draftsPageInitialState } from '../store/states';
import { ConfigHubDraftDetailsComponent } from './draft-details.component';

describe('ConfigHubDraftDetailsComponent', () => {
	let component: ConfigHubDraftDetailsComponent;
	let fixture: ComponentFixture<ConfigHubDraftDetailsComponent>;
	let mockStore: MockStore;

	jest.spyOn(fromDraftsPage, 'selectSelectedObjectId').mockReturnValue('object-id');
	jest.spyOn(fromDraftsPage, 'selectSelectedObjectType').mockReturnValue('ACCESS_PROFILES');
	jest.spyOn(fromDraftsPage, 'selectSelectedOperationType').mockImplementation(
		() =>
			createSelector(
				() => null,
				() => ObjectOperationType.CHANGED
			) as any
	);
	jest.spyOn(fromDraftsPage, 'selectSelectedOperationObject').mockImplementation(
		() =>
			createSelector(
				() => null,
				() => null,
				() => ({
					[ObjectDeltaTypeNames.ADDED]: 0,
					[ObjectDeltaTypeNames.DIFFERENT]: 6,
					[ObjectDeltaTypeNames.REMOVED]: 5
				})
			) as any
	);
	jest.spyOn(fromDraftsPage, 'selectObjectTypeShowErrorState').mockImplementation(
		createSelector(
			() => null,
			() => null,
			() => false
		) as any
	);

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfigHubDraftDetailsComponent],
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
			providers: [
				provideMockStore({
					initialState: draftsPageInitialState
				})
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA]
		}).compileComponents();

		mockStore = TestBed.inject(MockStore);
		fixture = TestBed.createComponent(ConfigHubDraftDetailsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('ngOnInit', () => {
		it('should set tabItems from all OperationTypes', done => {
			component.tabItems$.pipe(take(1)).subscribe(tabItems => {
				expect(tabItems.length).toEqual(3);
				expect(tabItems[0].disabled).toEqual(true);
				expect(tabItems[1].id).toEqual('slpt-draft-details-CHANGED-tab');
				expect(tabItems[2].count).toEqual(5);
				done();
			});
		});

		it('should dispatch the objectListOpen action', () => {
			const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
			component.ngOnInit();
			expect(dispatchSpy).toHaveBeenCalledWith(
				draftsPageActions.objectListOpen({
					objectType: 'ACCESS_PROFILES',
					objectOperationType: ObjectOperationType.CHANGED
				})
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

	describe('handleTabClick', () => {
		it('should dispatch the operationTypeChange action for the given operation type', () => {
			const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
			(component as any).handleTabClick(ObjectOperationType.CHANGED);

			expect(dispatchSpy).toHaveBeenCalledWith(
				draftsPageActions.operationTypeChange({
					objectType: 'ACCESS_PROFILES',
					objectOperationType: ObjectOperationType.CHANGED,
					showErrors: false
				})
			);
		});
	});
});

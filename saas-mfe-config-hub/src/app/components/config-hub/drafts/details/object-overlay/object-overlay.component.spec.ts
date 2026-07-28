/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder, FormControl } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule, createSelector } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateLoader } from '@ngx-translate/core';

import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { TranslateStaticLoader } from '@acme-priv/armada-angular/src/acme/angular/l10n/translate-static-loader';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { UnsavedChangesWarningService } from '@acme-priv/armada-angular/src/acme/angular/util/unsaved-changes-warning';

import { draftsPageActions } from '../../store/actions';
import { fromDraftsPage } from '../../store/selectors';

import { ConfigHubObjectTabs, ObjectOperationType, mockImportObject, mockObjectDetails } from '../../../shared/models';
import { draftsPageInitialState } from '../../store/states';
import { ConfigHubDraftDetailsComponent } from '../draft-details.component';
import { ConfigHubObjectOverlayComponent } from './object-overlay.component';

describe('ConfigHubObjectOverlayComponent', () => {
	let component: ConfigHubObjectOverlayComponent;
	let fixture: ComponentFixture<ConfigHubObjectOverlayComponent>;
	let unsavedChangesWarningService: UnsavedChangesWarningService;
	let mockStore: MockStore;

	jest.spyOn(fromDraftsPage, 'selectObjectDetails').mockImplementation(
		() =>
			createSelector(
				() => null,
				() => null,
				() => mockObjectDetails
			) as any
	);
	jest.spyOn(fromDraftsPage, 'selectBaseObjectStringified').mockImplementation(
		() =>
			createSelector(
				() => null,
				() => JSON.stringify(mockObjectDetails.object.object, null, 2)
			) as any
	);

	jest.spyOn(fromDraftsPage, 'selectLiveObjectStringified').mockImplementation(
		() =>
			createSelector(
				() => null,
				() => JSON.stringify({ ...mockObjectDetails.object.object, description: 'new description' }, null, 2)
			) as any
	);

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfigHubObjectOverlayComponent],
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
				}),
				UnsavedChangesWarningService,
				FormBuilder
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA]
		}).compileComponents();

		unsavedChangesWarningService = TestBed.inject(UnsavedChangesWarningService);
		jest.spyOn(unsavedChangesWarningService, 'promptToAbandonUnsavedChanges').mockReturnValue(
			Promise.resolve(true)
		);

		mockStore = TestBed.inject(MockStore);
		fixture = TestBed.createComponent(ConfigHubObjectOverlayComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('ngOnInit', () => {
		it('should call initObjectDetailsForm', () => {
			const initObjectDetailsFormSpy = jest.spyOn(component as any, 'initObjectDetailsForm');
			component.ngOnInit();

			expect(initObjectDetailsFormSpy).toHaveBeenCalled();
		});

		it('should call initErrorsDetail', () => {
			const initErrorsDetailSpy = jest.spyOn(component as any, 'initErrorsDetail');
			component.ngOnInit();

			expect(initErrorsDetailSpy).toHaveBeenCalled();
		});
	});

	describe('setSelectedOperationType', () => {
		it('isOperationChanged should be true and currentObjectOverlayTab should be CHANGES', () => {
			component.selectedOperationType = ObjectOperationType.CHANGED;
			component.currentObjectOverlayTab = ConfigHubObjectTabs.CHANGELOG;
			expect(component.isOperationChanged).toBeTruthy();
		});

		it('isOperationChanged should be false and currentObjectOverlayTab should be COMPARISON', () => {
			component.selectedOperationType = ObjectOperationType.ADDED;
			component.currentObjectOverlayTab = ConfigHubObjectTabs.JSON;
			expect(component.isOperationChanged).toBeFalsy();
		});
	});

	describe('handleDismiss', () => {
		it('should remove any objections in the UnsavedChangesWarningService', fakeAsync(() => {
			unsavedChangesWarningService.setObjection(ConfigHubDraftDetailsComponent);

			component.handleDismiss();
			tick();
			expect(unsavedChangesWarningService.hasObjections()).toBeFalsy();
		}));

		it('should mark the objectJsonFormControl as pristine', fakeAsync(() => {
			const markAsPristineSpy = jest.spyOn(component.objectJsonFormControl, 'markAsPristine');

			component.handleDismiss();
			tick();

			expect(markAsPristineSpy).toHaveBeenCalled();
		}));

		it('should dispatch the closeObjectDetails action', fakeAsync(() => {
			const dispatchSpy = jest.spyOn(mockStore, 'dispatch');

			component.handleDismiss();
			tick();

			expect(dispatchSpy).toHaveBeenCalledWith(draftsPageActions.closeObjectDetails());
		}));

		it('should emit an onClose event when called', fakeAsync(() => {
			const onCloseSpy = jest.spyOn(component.onClose, 'emit');

			component.handleDismiss();
			tick();

			expect(onCloseSpy).toHaveBeenCalled();
		}));
	});

	describe('handleSave', () => {
		beforeEach(() => {
			component.objectJsonFormControl = {
				valid: true,
				value: JSON.stringify(mockImportObject, null, 2),
				markAsPristine: () => {}
			} as FormControl;

			component.localDraftObjectJsonFormControl = {
				valid: true,
				value: JSON.stringify(mockImportObject, null, 2),
				markAsPristine: () => {}
			} as FormControl;
		});

		it('should emit a submitAttempted event', () => {
			const submitAttemptedSpy = jest.spyOn(component.submitAttempted, 'emit');

			component.handleSave();

			expect(submitAttemptedSpy).toHaveBeenCalled();
		});

		it('should dispatch the objectJsonChangesSaved action if the objectJsonFormControl is valid', () => {
			const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
			component.selectedObjectId = mockObjectDetails.objectId;
			component.selectedObjectType = mockObjectDetails.objectType;
			component.selectedOperationType = mockObjectDetails.operation;

			component.objectJsonFormControl.clearAsyncValidators();
			component.objectJsonFormControl.setValue(JSON.stringify(mockImportObject));
			component.objectJsonFormControl.updateValueAndValidity();

			component.handleSave();

			expect(dispatchSpy).toHaveBeenCalledWith(
				draftsPageActions.objectJsonChangesSaved({
					objectId: mockObjectDetails.objectId,
					objectType: mockObjectDetails.objectType,
					objectOperationType: mockObjectDetails.operation,
					objectJson: mockImportObject.object
				})
			);
		});

		it('should not dispatch the objectJsonChangesSaved action if the objectJsonFormControl is invalid', () => {
			const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
			component.objectJsonFormControl = { valid: false } as FormControl;

			component.handleSave();

			expect(dispatchSpy).not.toHaveBeenCalled();
		});

		it('should remove any objections in the UnsavedChangesWarningService if the objectJsonFormControl is valid', () => {
			unsavedChangesWarningService.setObjection(ConfigHubDraftDetailsComponent);

			component.handleSave();

			expect(unsavedChangesWarningService.hasObjections()).toBeFalsy();
		});

		it('should call handleDismiss if the objectJsonFormControl is valid', () => {
			const handleDismissSpy = jest.spyOn(component, 'handleDismiss');

			component.handleSave();

			expect(handleDismissSpy).toHaveBeenCalled();
		});
	});

	describe('handleTabClick', () => {
		it('should set the new value tab', () => {
			expect(component.currentObjectOverlayTab).toEqual(ConfigHubObjectTabs.JSON);
			component.handleTabClick(ConfigHubObjectTabs.ISSUES);
			expect(component.currentObjectOverlayTab).toEqual(ConfigHubObjectTabs.ISSUES);
		});
	});

	describe('compareJSONs', () => {
		it('should define the list of differences between live and draft jsons', () => {
			expect(component.jsonDiffList.length).toBe(0);
			const diffList = [{ op: 'replace', value: 'test2', path: '/test' }];
			const jsonA = { test: 'test' };
			const jsonB = { test: 'test2' };
			(component as any).compareJSONs(diffList, jsonA, jsonB);
			expect(component.jsonDiffList).toStrictEqual([
				{ op: 'replace', value: 'test2', path: '/test', oldValue: 'test' }
			]);
		});
	});

	describe('validateObjectWithJwsSignature', () => {
		it('should be disabled if object has signature', done => {
			component.ngOnInit();
			component.isObjectWithJwsSignature$.subscribe(isInvalid => {
				expect(isInvalid).toBeTruthy();
				done();
			});
		});
	});

	describe('setOverlayTabs', () => {
		it('should remove the CHANGES tab in the overlay if operation type is not equal to CHANGED', () => {
			component.isJsonChangelogFlagEnabled = true;
			component.selectedOperationType = ObjectOperationType.ADDED;

			(component as any).setOverlayTabs();

			expect(component.objectOverlayTabs.length).toBe(2);
		});

		it('should keep the CHANGES tab in the overlay if operation type is equal to CHANGED', () => {
			component.isJsonChangelogFlagEnabled = true;
			component.selectedOperationType = ObjectOperationType.CHANGED;

			(component as any).setOverlayTabs();

			expect(component.objectOverlayTabs.length).toBe(3);
		});
	});

	describe('setInitialTab', () => {
		it('should reset the default tab to EDIT if operation type is equal to CHANGED', () => {
			component.isJsonDiffViewFlagEnabled = true;
			component.selectedOperationType = ObjectOperationType.CHANGED;

			(component as any).setInitialTab();
			const expectedTab = component.getTabIndex(ConfigHubObjectTabs.EDIT);
			expect(component.currentObjectOverlayTab).toBe(expectedTab);
		});

		it('should reset the default tab to JSON if operation type is not equal to CHANGED', () => {
			component.isJsonChangelogFlagEnabled = true;
			component.selectedOperationType = ObjectOperationType.ADDED;

			(component as any).setInitialTab();
			const expectedTab = component.getTabIndex(ConfigHubObjectTabs.JSON);
			expect(component.currentObjectOverlayTab).toBe(expectedTab);
		});
	});

	describe('getTabIndex', () => {
		it('should get the tab array position not the tab index', () => {
			component.isJsonChangelogFlagEnabled = true;
			component.selectedOperationType = ObjectOperationType.CHANGED;
			const tabIndex = component.getTabIndex(ConfigHubObjectTabs.JSON);
			expect(tabIndex).toBe(1);
		});
	});

	describe('formatTabs', () => {
		it('should format tabs as preferred order', () => {
			const tabs = {
				[ConfigHubObjectTabs.CHANGELOG]: {
					withIcon: false,
					title: 'CONFIG_HUB.CHANGE_LOG',
					index: ConfigHubObjectTabs.CHANGELOG
				},
				[ConfigHubObjectTabs.EDIT]: {
					withIcon: false,
					title: 'CONFIG_HUB.EDIT_VIEW',
					index: ConfigHubObjectTabs.EDIT
				}
			};
			const tabsFormatted = (component as any).formatTabs(tabs);
			expect(tabsFormatted[0].index).toBe(ConfigHubObjectTabs.EDIT);
		});
	});
});

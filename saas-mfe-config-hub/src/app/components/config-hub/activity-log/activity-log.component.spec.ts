/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { GridReadyEvent, RowNode, ValueGetterFunc, ValueGetterParams } from 'ag-grid-community';
import { of, throwError } from 'rxjs';

import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ApiListResponse } from '@acme-priv/ui-common/src/acme/angular/api';

import {
	CONFIG_HUB_PAGE_SIZE_OPTIONS,
	ConfigHubDeployJob,
	mockConfigHubDeployJob,
	mockConfigHubSyncJob
} from '../shared/models';
import { ConfigHubDeployApiService } from '../shared/services';
import { ConfigHubCloudStorageSyncApiService } from '../shared/services/cloud-storage/cloud-storage-sync.service';
import { ConfigHubActivityLogComponent } from './activity-log.component';
import { ConfigHubActivityLogGridTabs, ConfigHubDeployListResponse } from './activity-log.model';

const mockGridReadyEvent = {
	api: {
		sizeColumnsToFit: jest.fn()
	}
} as unknown as GridReadyEvent;

describe('ActivityLogComponent', () => {
	let component: ConfigHubActivityLogComponent;
	let fixture: ComponentFixture<ConfigHubActivityLogComponent>;
	let datePipe: DatePipe;
	let http: HttpTestingController;
	let deployApiService: ConfigHubDeployApiService;
	let cloudStorageSyncApiService: ConfigHubCloudStorageSyncApiService;
	let apiPath: string;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfigHubActivityLogComponent],
			imports: [TranslateModule.forRoot(), CommonModule, HttpClientTestingModule],
			providers: [DatePipe]
		}).compileComponents();

		fixture = TestBed.createComponent(ConfigHubActivityLogComponent);
		component = fixture.componentInstance;
		datePipe = TestBed.inject(DatePipe);
		http = TestBed.inject(HttpTestingController);
		deployApiService = TestBed.inject(ConfigHubDeployApiService);
		cloudStorageSyncApiService = TestBed.inject(ConfigHubCloudStorageSyncApiService);
		fixture.detectChanges();

		apiPath = `${deployApiService.API_VERSION}://${deployApiService.API_PATH}`;
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('ngOnInit', () => {
		it('should call initializeGridOptions ', () => {
			const initializeOptionsSpy = jest.spyOn(component as any, 'selectDataToLoad');

			component.ngOnInit();

			expect(initializeOptionsSpy).toHaveBeenCalled();
			expect(component.columnDefs.length).toBeGreaterThan(0);
			expect(component.gridOptions).toBeDefined();
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

	describe('onGridReady', () => {
		it('should set the gridApi', () => {
			expect(component.gridApi).not.toBeDefined();

			component.onGridReady(mockGridReadyEvent);
			expect(component.gridApi).toBeDefined();
		});
	});

	describe('Activity Log Load Data', () => {
		it('should load rows data', fakeAsync(() => {
			jest.spyOn(deployApiService, 'getDeployListPaginated').mockReturnValue(
				of({
					items: [mockConfigHubDeployJob],
					nextToken: ''
				} as ConfigHubDeployListResponse)
			);

			component.ngOnInit();

			tick();

			const request = http.expectOne({
				url: `${apiPath + '?limit=50'}`,
				method: 'GET'
			});
			request.flush({});

			expect(component.rows).toEqual([mockConfigHubDeployJob]);

			http.verify();
		}));

		it('should display overlay when clicking view and download results', fakeAsync(() => {
			jest.spyOn(deployApiService, 'list').mockReturnValue(
				of({
					items: [mockConfigHubDeployJob],
					count: 1
				} as ApiListResponse<ConfigHubDeployJob>)
			);

			(component as any).onViewClick({ data: { jobId: mockConfigHubDeployJob.jobId } });

			tick();

			const request = http.expectOne({
				url: `${apiPath}/${mockConfigHubDeployJob.jobId}/download`,
				method: 'GET'
			});
			request.flush({});

			expect(component.downloadResults).toBeDefined();
			expect(component.showDetailsOverlay).toBe(true);
		}));
	});

	describe('initializeGridOptions', () => {
		it('load correct column defs', () => {
			component.ngOnInit();
			expect(component.columnDefs[0].headerName).toEqual('CONFIG_HUB.ACTIVITY_TYPE');
			expect(component.columnDefs[0].field).toEqual('type');
		});
	});

	describe('completedTimestamp column', () => {
		describe('valueGetter', () => {
			it('should return the created timestamp in a readable format', () => {
				const createdColValueGetter = component.columnDefs.find(colDef => colDef.field === 'created')
					?.valueGetter as ValueGetterFunc;

				const mockParams = { data: mockConfigHubDeployJob } as ValueGetterParams;

				expect(createdColValueGetter(mockParams)).toEqual(
					datePipe.transform(mockConfigHubDeployJob.created, 'medium')
				);
			});
		});

		describe('comparator', () => {
			it('should compare timestamps for sorting by creation date', () => {
				const timeDiff = 999;
				const timeA = new Date();
				const timeB = new Date(timeA.getTime() + timeDiff);

				const nodeA = { data: { created: timeA.toISOString() } } as RowNode;
				const nodeB = { data: { created: timeB.toISOString() } } as RowNode;

				component.ngOnInit();

				const createdColComparator = component.columnDefs.find(colDef => colDef.field === 'created')
					?.comparator as any;

				expect(createdColComparator(null, null, nodeA, nodeB, true)).toEqual(-timeDiff);
			});

			it('should compare timestamps for sorting by name', () => {
				const nameA = 'Backup A';
				const nameB = 'Backup B';

				const nodeA = { data: { draftName: nameA } } as RowNode;
				const nodeB = { data: { draftName: nameB } } as RowNode;

				component.ngOnInit();

				const draftNameColComparator = component.columnDefs.find(colDef => colDef.field === 'draftName')
					?.comparator as any;

				expect(draftNameColComparator(null, null, nodeA, nodeB, true)).toEqual(-1);
			});
		});
	});

	describe('activity column model', () => {
		describe('valueGetter', () => {
			it('should lowercase status column', () => {
				const statusGetter = component.columnDefs.find(colDef => colDef.field === 'status')
					?.valueGetter as ValueGetterFunc;

				const mockParams = { data: { status: 'COMPLETE' } } as ValueGetterParams;

				expect(statusGetter(mockParams)).toEqual('complete');
			});

			it('should lowercase requesterName column', () => {
				const statusGetter = component.columnDefs.find(colDef => colDef.field === 'requesterName')
					?.valueGetter as ValueGetterFunc;

				const mockParams = { data: { requesterName: 'SUPPORT' } } as ValueGetterParams;

				expect(statusGetter(mockParams)).toEqual('support');
			});
		});
	});

	describe('getJobsGridColumnDefs', () => {
		describe('type valueGetter', () => {
			it('should map deploy type', () => {
				const statusGetter = component.columnDefs.find(colDef => colDef.field === 'type')
					?.valueGetter as ValueGetterFunc;
				const mockParams = { data: { type: 'DEPLOY_CONFIGURATION_DRAFT' } } as ValueGetterParams;

				expect(statusGetter(mockParams)).toEqual('CONFIG_HUB.DEPLOY_CONFIGURATION_DRAFT');
			});
		});
	});

	describe('onPageChanged', () => {
		it('should change current page value, and call the getDeployListPaginated API method', () => {
			const pageNumber = 5;
			const spyOnGetDeployListPaginated = jest.spyOn(deployApiService, 'getDeployListPaginated');

			component.onPageChanged(pageNumber);
			expect(component.currentPage).toEqual(pageNumber);
			expect(spyOnGetDeployListPaginated).toHaveBeenCalled();

			spyOnGetDeployListPaginated.mockRestore();
		});
	});

	describe('onPageSizeChanges', () => {
		it('should change the pagesize vale and call the getDeployListPaginated API method', () => {
			const pageSize = 10;
			const spyOnGetDeployListPaginated = jest.spyOn(deployApiService, 'getDeployListPaginated');

			component.onPageSizeChanges(pageSize);
			expect(component.pageSize).toEqual(pageSize);
			expect(spyOnGetDeployListPaginated).toHaveBeenCalled();

			spyOnGetDeployListPaginated.mockRestore();
		});
	});

	describe('initializeDeployGridOptions', () => {
		it('load correct column defs for deploy', () => {
			const completeSpy = jest.spyOn(component as any, 'loadDeployLogs');

			component.currentTab = ConfigHubActivityLogGridTabs.GRID_DEPLOY;
			component.ngOnInit();
			expect(completeSpy).toHaveBeenCalled();
			expect(component.columnDefs[0].headerName).toEqual('CONFIG_HUB.ACTIVITY_TYPE');
			expect(component.columnDefs[0].field).toEqual('type');
			expect(component.columnDefs[1].headerName).toEqual('CONFIG_HUB.EVENT_ID');
		});
	});

	describe('initializeCloudSyncGridOptions', () => {
		it('load correct column defs for cloud sync', () => {
			const completeSpy = jest.spyOn(component as any, 'loadCloudSyncLogs');

			component.currentTab = ConfigHubActivityLogGridTabs.GRID_CLOUD;
			component.ngOnInit();
			expect(completeSpy).toHaveBeenCalled();
			expect(component.columnDefs[0].headerName).toEqual('CONFIG_HUB.ACTIVITY_TYPE');
			expect(component.columnDefs[0].field).toEqual('type');
			expect(component.columnDefs[1].headerName).toEqual('CONFIG_HUB.JOB_ID');
		});
	});

	describe('loadCloudSyncLogs', () => {
		it('should call initializeGridOptions ', () => {
			const pageSize = 10;
			const spyOnGetCloudSyncListPaginated = jest.spyOn(cloudStorageSyncApiService, 'getCloudSyncListPaginated');

			component.currentTab = ConfigHubActivityLogGridTabs.GRID_CLOUD;
			component.ngOnInit();

			component.onPageSizeChanges(pageSize);
			expect(component.pageSize).toEqual(pageSize);
			expect(spyOnGetCloudSyncListPaginated).toHaveBeenCalled();

			spyOnGetCloudSyncListPaginated.mockRestore();
		});
	});

	describe('updateGridForDeployRows', () => {
		it('should not update rows if deployLogs is not defined', () => {
			component.deployLogs = [];
			(component as any).updateGridForDeployRows();
			expect(component.rows).toEqual([]);
		});

		it('should update rows with deployLogs if defined', () => {
			const mockDeployLogs = [{}, {}, {}];
			(component as any).deployLogs = mockDeployLogs;
			(component as any).updateGridForDeployRows();
			expect(component.rows).toEqual(mockDeployLogs);
		});
	});

	describe('updateGridForCloudSyncRows', () => {
		it('should not update rows if cloudSyncLogs is not defined', () => {
			component.cloudSyncLogs = [];
			(component as any).updateGridForCloudSyncRows();
			expect(component.rows).toEqual([]);
		});

		it('should update rows with cloudSyncLogs if defined', () => {
			const mockCloudSyncLogs = [{}, {}, {}];
			(component as any).cloudSyncLogs = mockCloudSyncLogs;
			(component as any).updateGridForCloudSyncRows();
			expect(component.rows).toEqual(mockCloudSyncLogs);
		});
	});

	describe('reset variables', () => {
		it('should reset variables to their default state', () => {
			component['currentPage'] = 5;
			component['totalPages'] = 10;
			component['lastEvalulatedObject'] = { key: 'value' };
			(component as any)['cloudSyncLogs'] = [{ log: 'test' }];
			(component as any)['deployLogs'] = [{ log: 'test' }];

			(component as any).resetVariables();

			expect(component['totalPages']).toBeNull();
			expect(component['lastEvaluatedObject']).toBeNull();
			expect(component['cloudSyncLogs']).toEqual([]);
			expect(component['deployLogs']).toEqual([]);
		});
	});

	describe('ComponentWithShowTabMethod', () => {
		it('should return false if tabIndex is GRID_CLOUD', () => {
			component.canUserSeeCloudStorage = false;
			const result = component.showTab(ConfigHubActivityLogGridTabs.GRID_CLOUD);
			expect(result).toBeFalsy();
		});

		it('should return true if tabIndex is GRID_CLOUD', () => {
			component.canUserSeeCloudStorage = true;
			const result = component.showTab(ConfigHubActivityLogGridTabs.GRID_CLOUD);
			expect(result).toBeTruthy();
		});

		it('should return true for any tab when canUserSeeCloudStorage is true', () => {
			component.canUserSeeCloudStorage = true;
			let result = component.showTab(ConfigHubActivityLogGridTabs.GRID_CLOUD);
			expect(result).toBeTruthy();
			result = component.showTab(ConfigHubActivityLogGridTabs.GRID_DEPLOY);
			expect(result).toBeTruthy();
		});

		it('should return true for non-GRID_CLOUD tabs', () => {
			const result = component.showTab(ConfigHubActivityLogGridTabs.GRID_DEPLOY);
			expect(result).toBeTruthy();
		});
	});

	describe('ComponentWithHandleTabClickMethod', () => {
		it('should update currentTab and pageSize on tab click', () => {
			const tab = 1;
			component.handleTabClick(tab);
			expect(component.currentTab).toEqual(tab);
			expect(component.pageSize).toEqual(CONFIG_HUB_PAGE_SIZE_OPTIONS[2]);
		});

		it('should call resetVariables on tab click', () => {
			const tab = 1;
			const spy = jest.spyOn(component as any, 'resetVariables');

			component.handleTabClick(tab);
			expect(spy).toHaveBeenCalled();
		});

		it('should call selectDataToLoad with the correct tab on tab click', () => {
			const tab = 1;

			const spy = jest.spyOn(component as any, 'selectDataToLoad');

			component.handleTabClick(tab);
			expect(spy).toHaveBeenCalled();
		});
	});

	describe('ActivityLogComponent', () => {
		describe('onGridReady', () => {
			it('should set gridApi when not already set', () => {
				component.onGridReady(mockGridReadyEvent);
				expect(component.gridApi).toEqual(mockGridReadyEvent);
			});

			it('should call updateGridForDeployRows when currentTab is GRID_DEPLOY', () => {
				const spy = jest.spyOn(component as any, 'updateGridForDeployRows');
				component.currentTab = ConfigHubActivityLogGridTabs.GRID_DEPLOY;
				component.onGridReady();
				expect(spy).toHaveBeenCalled();
			});

			it('should call updateGridForCloudSyncRows when currentTab is GRID_CLOUD', () => {
				const spy = jest.spyOn(component as any, 'updateGridForCloudSyncRows');
				component.currentTab = ConfigHubActivityLogGridTabs.GRID_CLOUD;
				component.onGridReady();
				expect(spy).toHaveBeenCalled();
			});
		});

		describe('handleDetailsOverlayClose', () => {
			it('should hide the details overlay and reset selected details', () => {
				component.showDetailsOverlay = true;
				(component as any).selectedDetails = {};
				component.handleDetailsOverlayClose();
				expect(component.showDetailsOverlay).toBeFalsy();
				expect(component.selectedDetails).toBeNull();
			});
		});
	});

	describe('ActivityLogComponent', () => {
		describe('loadDeployLogs', () => {
			it('should use cached data if available', () => {
				(component as any).deployObjectsRetrieved[component.pageSize] = [
					{
						items: [mockConfigHubDeployJob],
						nextToken: null
					}
				];
				component.currentPage = 1;

				(component as any).loadDeployLogs();

				expect(component.deployLogs).toEqual([mockConfigHubDeployJob]);
				expect(component.loading).toBeFalsy();
			});

			it('should call API and update data on success', done => {
				const mockApiResponse = {
					items: [mockConfigHubDeployJob],
					nextToken: 'nextTokenValue'
				};
				jest.spyOn(deployApiService, 'getDeployListPaginated').mockReturnValue(of(mockApiResponse));

				(component as any).loadDeployLogs();

				fixture.whenStable().then(() => {
					expect(component.deployLogs).toEqual([mockConfigHubDeployJob]);
					expect(component.loading).toBeFalsy();
					done();
				});
			});

			it('should handle API error', done => {
				jest.spyOn(deployApiService, 'getDeployListPaginated').mockReturnValue(
					throwError(() => new Error('Error'))
				);

				(component as any).loadDeployLogs();

				fixture.whenStable().then(() => {
					expect(component.loading).toBeFalsy();
					done();
				});
			});
		});

		describe('loadCloudSyncLogs', () => {
			it('should use cached data if available', () => {
				(component as any).cloudSyncObjectsRetrieved[component.pageSize] = [
					{
						items: [mockConfigHubSyncJob],
						nextToken: null
					}
				];
				component.currentPage = 1;

				(component as any).loadCloudSyncLogs();

				expect(component.cloudSyncLogs).toEqual([mockConfigHubSyncJob]);
				expect(component.loading).toBeFalsy();
			});

			it('should call API and update data on success', done => {
				const mockApiResponse = {
					items: [mockConfigHubSyncJob],
					nextToken: 'nextTokenValue'
				};
				jest.spyOn(cloudStorageSyncApiService, 'getCloudSyncListPaginated').mockReturnValue(
					of(mockApiResponse)
				);

				(component as any).loadCloudSyncLogs();

				fixture.whenStable().then(() => {
					expect(component.cloudSyncLogs).toEqual([mockConfigHubSyncJob]);
					expect(component.loading).toBeFalsy();
					done();
				});
			});

			it('should handle API error', done => {
				jest.spyOn(cloudStorageSyncApiService, 'getCloudSyncListPaginated').mockReturnValue(
					throwError(() => new Error('Error'))
				);

				(component as any).loadCloudSyncLogs();

				fixture.whenStable().then(() => {
					expect(component.loading).toBeFalsy();
					done();
				});
			});
		});
	});
});

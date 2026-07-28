/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { TranslateLoader } from '@ngx-translate/core';

import { TranslateStaticLoader } from '@acme-priv/armada-angular/src/acme/angular/l10n/translate-static-loader';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubBackupsApiService } from '../../shared/services';
import { ConfigHubConfigObjectsService } from '../../shared/services/config-objects/config-objects.service';
import { ConfigHubBackupDetailsComponent } from './backup-details.component';

describe('BackupDetailsComponent', () => {
	let component: ConfigHubBackupDetailsComponent;
	let fixture: ComponentFixture<ConfigHubBackupDetailsComponent>;
	const routerMock = {
		lastSuccessfulNavigation: {
			extras: {
				state: {
					summary: {
						objectBreakdown: {
							ROLE: 7,
							AUTH_ORG: 1,
							SOURCE: 7,
							ACCESS_PROFILE: 12,
							IDENTITY_PROFILE: 4,
							GOVERNANCE_GROUP: 2,
							TRIGGER_SUBSCRIPTION: 14
						},
						name: 'test-name'
					}
				}
			}
		}
	};

	const routeMock = { snapshot: { paramMap: { get: value => value } } };

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfigHubBackupDetailsComponent],
			imports: [
				TranslateModule.forRoot({
					loader: {
						provide: TranslateLoader,
						useClass: TranslateStaticLoader
					}
				}),
				HttpClientTestingModule
			],
			providers: [
				{
					provide: Router,
					useValue: routerMock
				},
				{
					provide: ActivatedRoute,
					useValue: routeMock
				}
			]
		});
	});

	describe('ngOnInit', () => {
		beforeEach(() => {
			TestBed.compileComponents();
			TestBed.inject(ConfigHubConfigObjectsService);
			TestBed.inject(ConfigHubBackupsApiService);
			fixture = TestBed.createComponent(ConfigHubBackupDetailsComponent);
			component = fixture.componentInstance;
			fixture.detectChanges();
		});

		it('should create', () => {
			expect(component).toBeTruthy();
			expect(component.jobId).toEqual('id');
		});

		it('should check status', () => {
			const checkStatusSpy = jest.spyOn(component as any, 'checkStatus');
			component.ngOnInit();
			expect(checkStatusSpy).toHaveBeenCalled();
		});
		it('should init breakdown object', () => {
			const initObjectBreakdownSpy = jest.spyOn(component as any, 'initObjectBreakdown');
			component.ngOnInit();
			expect(initObjectBreakdownSpy).toHaveBeenCalled();
		});
		it('should select type change', () => {
			const handleTypeSelectionChangeSpy = jest.spyOn(component as any, 'handleTypeSelectionChange');
			component.ngOnInit();
			expect(handleTypeSelectionChangeSpy).toHaveBeenCalled();
		});
		it('sidebar should default to first element in objectBreakdown', () => {
			component.ngOnInit();
			expect(component.selectedObjectType.type).toBe('ACCESS_PROFILE');
		});
		it('next and previous buttons should change the selectedType to the next and previous object types in the list', () => {
			component.ngOnInit();
			expect(component.selectedObjectType.type).toBe('ACCESS_PROFILE');
			component.nextObject();
			expect(component.selectedObjectType.type).toBe('AUTH_ORG');
			component.previousObject();
			expect(component.selectedObjectType.type).toBe('ACCESS_PROFILE');
		});
	});

	describe('initObjectBreakdown', () => {
		beforeEach(() => {
			TestBed.overrideProvider(Router, {
				useValue: {
					lastSuccessfulNavigation: {
						extras: {
							state: {
								summary: {}
							}
						}
					}
				}
			});
			TestBed.compileComponents();
			TestBed.inject(ConfigHubConfigObjectsService);
			TestBed.inject(ConfigHubBackupsApiService);
			fixture = TestBed.createComponent(ConfigHubBackupDetailsComponent);
			component = fixture.componentInstance;
			fixture.detectChanges();
		});

		it('should init call breakdown api if not data is set', () => {
			const loadObjectBreakdownSpy = jest.spyOn(component as any, 'loadObjectBreakdown');
			(component as any).initObjectBreakdown();
			expect(loadObjectBreakdownSpy).toHaveBeenCalled();
		});
	});
});

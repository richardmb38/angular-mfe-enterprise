/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { GridReadyEvent } from 'ag-grid-community';

import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubObjectMapping } from '../../shared/models';
import { ConfigHubObjectMappingService } from '../../shared/services/object-mappings/object-mappings.service';
import { ConfigHubObjectMappingOverlayComponent } from './object-mapping-create-overlay.component';

const mockGridReadyEvent = {
	api: {
		sizeColumnsToFit: jest.fn()
	}
} as unknown as GridReadyEvent;

describe('ConfigHubObjectMappingOverlayComponent', () => {
	let component: ConfigHubObjectMappingOverlayComponent;
	let fixture: ComponentFixture<ConfigHubObjectMappingOverlayComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfigHubObjectMappingOverlayComponent],
			imports: [TranslateModule.forRoot(), HttpClientTestingModule]
		}).compileComponents();
	});

	beforeEach(() => {
		TestBed.inject(ConfigHubObjectMappingService);
		fixture = TestBed.createComponent(ConfigHubObjectMappingOverlayComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
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

	describe('handleDismiss', () => {
		it('should emit an onDismiss event when called', fakeAsync(() => {
			const onDismissSpy = jest.spyOn(component.onDismiss, 'emit');

			component.handleDismiss();
			tick();

			expect(onDismissSpy).toHaveBeenCalled();
		}));
	});

	describe('handleAddMapping', () => {
		it('should add to mapping', done => {
			component.objectMappingList$.next([]);
			component.handleAddMapping();
			component.objectMappingList$.subscribe(mappingList => {
				expect(mappingList.length).toEqual(1);
				done();
			});
		});
	});

	describe('getMappingPayload', () => {
		it('should remove mapping id from payload', () => {
			component.handleAddMapping();
			const payload = (component as any).getMappingPayload();
			expect(payload[0]).not.toHaveProperty('objectMappingId');
		});
	});

	describe('onWindowSizeChangedEvent', () => {
		it('should resize the columns on window size change', () => {
			component.onGridReady(mockGridReadyEvent);
			const sizeColumnsToFitSpy = jest.spyOn((component as any).gridApi.api, 'sizeColumnsToFit');

			component.onWindowSizeChangedEvent();
			expect(sizeColumnsToFitSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('removeRow', () => {
		it('should remove the passed row from node data', done => {
			component.objectMappingList$.next([
				{ objectMappingId: 'Test1' },
				{ objectMappingId: 'Test2' }
			] as Array<ConfigHubObjectMapping>);

			(component as any).removeRow({
				data: { objectMappingId: 'Test2' }
			});

			component.objectMappingList$.subscribe(list => {
				expect(list.length).toEqual(1);
				done();
			});
		});
	});
});

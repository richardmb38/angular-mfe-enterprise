/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ICellRendererParams } from 'ag-grid-community';
import { BehaviorSubject } from 'rxjs';

import { mockConfigHubBackupJob } from '../../shared/models';
import { DateTimeCreatedCellComponent } from './date-time-created-cell.component';

describe('DateTimeCreatedCellComponent', () => {
	let component: DateTimeCreatedCellComponent;
	let fixture: ComponentFixture<DateTimeCreatedCellComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [CommonModule],
			declarations: [DateTimeCreatedCellComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(DateTimeCreatedCellComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

	describe('agInit', () => {
		it('should set the completed date and whether backup is the latest', () => {
			component.agInit({ value: '123', latestCompletedJobId$: new BehaviorSubject(null) } as
				| ICellRendererParams
				| any);
			expect(component.completedDate).toEqual('123');
			expect(component.isLatestCompleted).toEqual(false);
		});

		it('should set isLatestCompleted true if jobId match with context jobId', fakeAsync(() => {
			expect(component.isLatestCompleted).toBe(false);
			component.agInit({
				value: '123',
				data: mockConfigHubBackupJob,
				latestCompletedJobId$: new BehaviorSubject(mockConfigHubBackupJob.jobId)
			} as ICellRendererParams | any);

			tick();

			expect(component.isLatestCompleted).toBe(true);
		}));

		it('should set isLatestCompleted false if jobId does not match with context data', fakeAsync(() => {
			component.agInit({
				value: '123',
				data: mockConfigHubBackupJob,
				latestCompletedJobId$: new BehaviorSubject(null)
			} as ICellRendererParams | any);

			tick();

			expect(component.isLatestCompleted).toBe(false);
		}));
	});

	describe('refresh', () => {
		it('should return false', () => {
			expect(component.refresh()).toEqual(false);
		});
	});
});

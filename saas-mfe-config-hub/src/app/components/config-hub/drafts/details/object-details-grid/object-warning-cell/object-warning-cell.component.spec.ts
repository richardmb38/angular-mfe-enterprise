/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ICellRendererParams } from 'ag-grid-community';

import { mockObjectDetails } from '../../../../shared/models';
import { ObjectWarningCellComponent } from './object-warning-cell.component';

describe('ObjectWarningCellComponent', () => {
	let component: ObjectWarningCellComponent;
	let fixture: ComponentFixture<ObjectWarningCellComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [CommonModule],
			declarations: [ObjectWarningCellComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(ObjectWarningCellComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

	describe('agInit', () => {
		it('should set whether the object hasDeployIssues', () => {
			component.agInit({ value: mockObjectDetails.objectName, data: mockObjectDetails } as ICellRendererParams);
			expect(component.hasDeployIssues).toEqual(mockObjectDetails.hasErrors);
		});
	});

	describe('refresh', () => {
		it('should return false', () => {
			expect(component.refresh()).toEqual(false);
		});
	});
});

/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ICellRendererParams } from 'ag-grid-community';

import { ObjectTypeCellComponent } from './object-type-cell.component';

describe('ObjectTypeCellComponent', () => {
	let component: ObjectTypeCellComponent;
	let fixture: ComponentFixture<ObjectTypeCellComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [CommonModule],
			declarations: [ObjectTypeCellComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(ObjectTypeCellComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

	describe('agInit', () => {
		it('should set correct object type', () => {
			component.agInit({
				value: 'MOCK_OBJECT_TYPE',
				data: { added: 0, numberOfObjectsTarget: 0 }
			} as ICellRendererParams);
			expect(component.objectType).toEqual('MOCK_OBJECT_TYPE');
		});
	});

	describe('refresh', () => {
		it('should return false', () => {
			expect(component.refresh()).toEqual(false);
		});
	});
});

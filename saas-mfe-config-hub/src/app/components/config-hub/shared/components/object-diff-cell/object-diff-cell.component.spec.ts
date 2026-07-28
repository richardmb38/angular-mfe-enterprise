/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectDeltaTypeNames } from '../../models';
import { ObjectDiffCellComponent } from './object-diff-cell.component';
import { ObjectDiffCellClasses, ObjectDiffCellRendererParams } from './object-diff-cell.model';

describe('ObjectDiffCellComponent', () => {
	let component: ObjectDiffCellComponent;
	let fixture: ComponentFixture<ObjectDiffCellComponent>;

	const mockCellRendererParams = {
		node: {
			isSelected: jest.fn()
		},
		value: 0,
		operation: ObjectDeltaTypeNames.ADDED
	} as unknown as ObjectDiffCellRendererParams;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ObjectDiffCellComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ObjectDiffCellComponent);
		component = fixture.componentInstance;
		component.agInit(mockCellRendererParams);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('agInit', () => {
		it('should set the component classes', () => {
			const initParams = { ...mockCellRendererParams, value: 4, operation: ObjectDeltaTypeNames.REMOVED };
			component.agInit(initParams);
			expect(component.params).toEqual(initParams);
		});
	});

	describe('refresh', () => {
		it('should update the component classes', () => {
			const refreshParams = { ...mockCellRendererParams, value: 2, operation: ObjectDeltaTypeNames.DIFFERENT };
			component.refresh(refreshParams);
			expect(component.params).toEqual(refreshParams);
		});
	});

	describe('getCellCssClasses', () => {
		it('should set the component as faded and not clickable when value is 0', () => {
			jest.spyOn(component.params.node, 'isSelected').mockReturnValue(true);
			expect(component.getCellCssClasses()).toEqual({
				[ObjectDiffCellClasses.FADED]: true,
				[ObjectDiffCellClasses.CLICKABLE]: false,
				[ObjectDiffCellClasses.DISABLED]: false
			});
		});

		it('should set the component as clickable when value is greater than 0', () => {
			const newParams = { ...mockCellRendererParams, value: 1 };
			component.refresh(newParams);
			jest.spyOn(component.params.node, 'isSelected').mockReturnValue(true);
			expect(component.getCellCssClasses()).toEqual({
				[ObjectDiffCellClasses.FADED]: false,
				[ObjectDiffCellClasses.CLICKABLE]: true,
				[ObjectDiffCellClasses.DISABLED]: false
			});
		});

		it('should set the component as disabled when it is not selected', () => {
			jest.spyOn(component.params.node, 'isSelected').mockReturnValue(false);
			expect(component.getCellCssClasses()).toEqual({
				[ObjectDiffCellClasses.FADED]: true,
				[ObjectDiffCellClasses.CLICKABLE]: false,
				[ObjectDiffCellClasses.DISABLED]: true
			});
		});
	});

	describe('getCellHighlightCssClass', () => {
		it('should not set the component operation highlight class is value 0', () => {
			component.refresh(mockCellRendererParams);
			expect(component.getCellHighlightCssClass()).toEqual({
				[ObjectDiffCellClasses.HIGHLIGHT]: true,
				[`${ObjectDiffCellClasses.HIGHLIGHT}--${ObjectDeltaTypeNames.ADDED}`]: false
			});
		});

		it('should set the component operation highlight class is value is greater than 0', () => {
			const newParams = { ...mockCellRendererParams, value: 1 };
			component.refresh(newParams);
			expect(component.getCellHighlightCssClass()).toEqual({
				[ObjectDiffCellClasses.HIGHLIGHT]: true,
				[`${ObjectDiffCellClasses.HIGHLIGHT}--${ObjectDeltaTypeNames.ADDED}`]: true
			});
		});
	});
});

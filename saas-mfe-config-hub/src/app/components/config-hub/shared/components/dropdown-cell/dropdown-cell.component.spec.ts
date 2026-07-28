/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import { DropdownCellComponent } from './dropdown-cell.component';
import { DropdownCellRendererParams } from './dropdown-cell.model';

describe('DropdownCellComponent', () => {
	let component: DropdownCellComponent;
	let fixture: ComponentFixture<DropdownCellComponent>;

	const mockCellRendererParams = {
		setValue: jest.fn(),
		options$: of([{ displayName: 'TEST' }, { displayName: 'TEST2' }]),
		placeholder: 'SELECT',
		value: 'TEST'
	} as unknown as DropdownCellRendererParams;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [DropdownCellComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(DropdownCellComponent);
		component = fixture.componentInstance;
		component.agInit(mockCellRendererParams);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('agInit', () => {
		it('should set the component params', () => {
			const initParams = { ...mockCellRendererParams };
			component.agInit(initParams);
			expect(component.params).toEqual(initParams);
		});

		it('initial selection should be ', done => {
			const initParams = { ...mockCellRendererParams };
			component.agInit(initParams);
			component.initialSelection$.subscribe(value => {
				expect(value).toEqual({ displayName: 'TEST' });
				done();
			});
		});
	});

	describe('handleChangeType', () => {
		it('should call to update value', () => {
			const change = { displayName: 'TEST' };
			const setValueSpy = jest.spyOn(component.params, 'setValue');
			component.handleChangeType(change);
			expect(setValueSpy).toHaveBeenCalledWith(change.displayName);
		});
	});
});

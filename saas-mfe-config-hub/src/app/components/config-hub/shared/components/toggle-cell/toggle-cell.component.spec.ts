/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ICellRendererParams } from 'ag-grid-community';

import { ToggleModule } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ToggleCellComponent } from './toggle-cell.component';

describe('ToggleCellComponent', () => {
	let component: ToggleCellComponent;
	let fixture: ComponentFixture<ToggleCellComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ToggleCellComponent],
			imports: [ToggleModule, TranslateModule.forRoot()]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ToggleCellComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('agInit', () => {
		it('should set isEnabled', () => {
			const params = {
				value: true
			} as unknown as ICellRendererParams;
			component.agInit(params);

			expect(component.isEnabled).toBeTruthy();
		});
	});

	describe('refresh', () => {
		it('should return false', () => {
			expect(component.refresh()).toBeFalsy();
		});
	});
});

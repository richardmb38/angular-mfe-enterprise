/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { IconCellComponent } from './icon-cell.component';
import { IconCellIcons, IconCellRendererParams } from './icon-cell.model';

describe('IconCellComponent', () => {
	let component: IconCellComponent;
	let fixture: ComponentFixture<IconCellComponent>;

	const mockCellRendererParams = {
		iconName: IconCellIcons.pencil,
		useText: true
	} as unknown as IconCellRendererParams;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TranslateModule.forRoot({})],
			declarations: [IconCellComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(IconCellComponent);
		component = fixture.componentInstance;
		component.agInit(mockCellRendererParams);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('agInit', () => {
		it('should set the initial params', () => {
			const initParams = { ...mockCellRendererParams, iconName: IconCellIcons.pencil, useText: true };
			component.agInit(initParams);
			expect(component.params).toEqual(initParams);
		});
	});

	describe('refresh', () => {
		it('should update the params', () => {
			const refreshParams = { ...mockCellRendererParams, iconName: IconCellIcons.pencil, useText: false };
			component.refresh(refreshParams);
			expect(component.params).toEqual(refreshParams);
		});
	});
});

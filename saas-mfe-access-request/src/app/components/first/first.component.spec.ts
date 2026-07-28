/*
 * Copyright (C) 2025 Acme Technologies, Inc.  All rights reserved.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { FirstComponent } from './first.component';

describe('FirstComponent', () => {
	let component: FirstComponent;
	let fixture: ComponentFixture<FirstComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [RouterTestingModule],
			declarations: [FirstComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(FirstComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});

/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { TestBed } from '@angular/core/testing';

import { ConfigHubDeployOverlayService } from './deploy-overlay.service';

describe('ConfigHubDeployOverlayService', () => {
	let service: ConfigHubDeployOverlayService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(ConfigHubDeployOverlayService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should dispatch events for opening and closing the overlay', () => {
		const nextSpy = jest.spyOn(service.isOverlayOpen$, 'next');

		service.handleOpen();

		expect(nextSpy).toHaveBeenCalledWith(true);

		service.handleDismiss();

		expect(nextSpy).toHaveBeenCalledWith(false);
	});
});

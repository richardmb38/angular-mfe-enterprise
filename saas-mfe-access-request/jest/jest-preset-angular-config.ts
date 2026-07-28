/*
 * Copyright (C) 2025 Acme Technologies, Inc.  All rights reserved.
 */

// Global variables necessary for jest-preset-angular to enforce certain configurations.
// https://github.com/thymikee/jest-preset-angular/blob/main/setup-jest.js#L16
globalThis.ngJest = {
	testEnvironmentOptions: {
		errorOnUnknownElements: true,
		errorOnUnknownProperties: true
	}
};

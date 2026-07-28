/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */

Object.defineProperty(window, 'CSS', { value: null });

const mock = () => {
	let storage = {};
	return {
		clear: () => (storage = {}),
		getItem: key => (key in storage ? storage[key] : null),
		removeItem: key => delete storage[key],
		setItem: (key, value) => (storage[key] = value || '')
	};
};

// browser mocks
const localStorageMock = (function () {
	let store = {};
	return {
		getItem: function (key) {
			return store[key] || null;
		},
		setItem: function (key, value) {
			store[key] = value.toString();
		},
		removeItem: function (key) {
			delete store[key];
		},
		clear: function () {
			store = {};
		}
	};
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'sessionStorage', { value: mock() });
Object.defineProperty(document, 'doctype', { value: '<!DOCTYPE html>' });
Object.defineProperty(window, 'getComputedStyle', {
	value: () => {
		return {
			appearance: ['-webkit-appearance'],
			display: 'none'
		};
	}
});

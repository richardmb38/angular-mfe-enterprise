/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */

export interface GenericResponse {
	/**
	 * Name of the tenant where this job was initiated.
	 */
	tenant: string;

	/**
	 * Name of the tenant where this job was initiated.
	 */
	message: string;
}

export interface ConfigHubGenericApiResponse<T> {
	body: T;
}

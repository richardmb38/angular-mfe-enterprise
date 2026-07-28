/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { ConfigHubGenericApiResponse, GenericResponse } from './generic-response.model';

export const mockGenericResponse: GenericResponse = {
	tenant: 'some-tenant',
	message: 'some-message'
};

export const mockGenericApiResponse: ConfigHubGenericApiResponse<GenericResponse> = {
	body: {
		tenant: 'some-tenant',
		message: 'some-message'
	}
};

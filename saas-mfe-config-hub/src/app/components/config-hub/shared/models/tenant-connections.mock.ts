/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { ConfigHubTenantConnection } from './tenant-connections.model';

export const mockConfigHubTenantConnection: ConfigHubTenantConnection = {
	targetTenant: 'targetTenant',
	targetUserId: 'user123',
	targetUserName: 'user',
	sourceTenant: 'sourceTenant',
	sourcePatClientId: '123456789',
	sourceUserId: 'user456',
	sourceUserName: 'user',
	created: '2023-07-12T18:47:08.126Z',
	modified: '2023-07-12T18:47:08.126Z',
	clientUrl: 'http://someurl.com'
};

export const mockConfigHubTenantConnectionsList: ConfigHubTenantConnection[] = [
	mockConfigHubTenantConnection,
	{
		targetTenant: 'targetTenant2',
		targetUserId: 'user1232222',
		targetUserName: 'user2',
		sourceTenant: 'sourceTenant2',
		sourcePatClientId: '1234567892',
		sourceUserId: 'user4562',
		sourceUserName: 'user2',
		created: '2023-07-12T20:47:08.126Z',
		modified: '2023-07-12T20:47:08.126Z',
		clientUrl: 'http://someurl2.com'
	}
];

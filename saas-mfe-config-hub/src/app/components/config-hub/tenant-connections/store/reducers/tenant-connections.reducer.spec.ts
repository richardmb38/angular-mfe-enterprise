/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { RequestState } from '@acme-priv/ui-common/src/acme/angular/util/atomic-state';

import { tenantConnectionsApiActions, tenantConnectionsSidebarActions } from '../actions';
import { TenantConnectionsReducer } from './tenant-connections.reducer';

import { mockConfigHubTenantConnectionsList } from '../../../shared/models';
import {
	TenantConnectionsAtomicState,
	TenantConnectionsState,
	tenantConnectionsAtomicAdapter,
	tenantConnectionsInitialState
} from '../states';

describe('TenantConnectionsReducer', () => {
	const errorMessage = 'There was an error';
	const tenantConnectionId = 'tenant-connection-id';

	describe('tenantConnectionsLoadList', () => {
		it("should set the tenantConnection's requestState to LOADING", () => {
			expect(
				TenantConnectionsReducer(
					tenantConnectionsInitialState,
					tenantConnectionsApiActions.tenantConnectionsLoadList()
				)
			).toEqual({
				...tenantConnectionsInitialState,
				tenantConnections: {
					...tenantConnectionsInitialState.tenantConnections,
					requestState: RequestState.LOADING
				}
			});
		});
	});

	describe('tenantConnectionsLoadSuccess', () => {
		it("should set the tenantConnection's requestState to RESOLVED and set the tenant connections list", () => {
			const mockApiListResponse = {
				items: mockConfigHubTenantConnectionsList,
				offset: 0,
				limit: 6,
				count: 12
			};

			const loadedTenantConnectionsState: TenantConnectionsAtomicState = tenantConnectionsAtomicAdapter.addMany(
				mockApiListResponse.items,
				{
					...tenantConnectionsInitialState.tenantConnections,
					requestState: RequestState.RESOLVED
				}
			);

			expect(
				TenantConnectionsReducer(
					tenantConnectionsInitialState,
					tenantConnectionsApiActions.tenantConnectionsLoadSuccess({ tenantConnections: mockApiListResponse })
				)
			).toEqual({
				...tenantConnectionsInitialState,
				tenantConnections: {
					...tenantConnectionsInitialState.tenantConnections,
					...loadedTenantConnectionsState
				}
			});
		});
	});

	describe('tenantConnectionsLoadFailure', () => {
		it("should set the tenantConnection's requestState to an error message", () => {
			expect(
				TenantConnectionsReducer(
					tenantConnectionsInitialState,
					tenantConnectionsApiActions.TenantConnectionsLoadFailure({ errorMessage })
				)
			).toEqual({
				...tenantConnectionsInitialState,
				tenantConnections: {
					...tenantConnectionsInitialState.tenantConnections,
					requestState: { errorMsg: errorMessage }
				}
			});
		});
	});

	describe('tenantConnectionsSidebarSelect', () => {
		it('should update the selectedObjectId', () => {
			expect(
				TenantConnectionsReducer(
					tenantConnectionsInitialState,
					tenantConnectionsSidebarActions.tenantConnectionsSidebarSelect({
						tenantConnectionId: tenantConnectionId
					})
				)
			).toEqual({ ...tenantConnectionsInitialState, selectedSidebarConnection: tenantConnectionId });
		});
	});

	describe('tenantConnectionsSidebarLeave', () => {
		it('should set the selectedObjectId to null', () => {
			const initialState: TenantConnectionsState = {
				...tenantConnectionsInitialState,
				selectedSidebarConnection: tenantConnectionId
			};

			expect(
				TenantConnectionsReducer(initialState, tenantConnectionsSidebarActions.tenantConnectionsSidebarLeave())
			).toEqual(tenantConnectionsInitialState);
		});
	});
});

/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { NgModule } from '@angular/core';

import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule, routerReducer } from '@ngrx/router-store';
import { StoreModule as NgrxStoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

@NgModule({
	imports: [
		EffectsModule.forRoot([]),
		NgrxStoreModule.forRoot({
			routerReducer: routerReducer
		}),
		StoreRouterConnectingModule.forRoot(),
		StoreDevtoolsModule.instrument({
			maxAge: 25,
			connectInZone: true
		})
	]
})
export class StoreModule {}

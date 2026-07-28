/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ConfigHubRoutes } from './components/config-hub/config-hub.routes';

const routes: Routes = ConfigHubRoutes;

@NgModule({
	imports: [RouterModule.forRoot(routes)]
})
export class AppRoutingModule {}

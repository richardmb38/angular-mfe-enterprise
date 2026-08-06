/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { EmptyRouteComponent } from './components/empty-route/empty-route.component';
import { FirstComponent } from './components/first/first.component';

const routes: Routes = [
	{ path: 'admin/accounts-management', component: FirstComponent },
	{ path: '**', component: EmptyRouteComponent }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)]
})
export class AppRoutingModule {}

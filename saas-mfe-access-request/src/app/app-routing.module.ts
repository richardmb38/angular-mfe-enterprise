/*
 * Copyright (C) 2025 Acme Technologies, Inc.  All rights reserved.
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: 'first',
		loadChildren: () => import('./components/first/first.module').then(m => m.FirstModule)
	},
	{
		path: '**',
		redirectTo: 'first',
		pathMatch: 'full'
	}
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {}

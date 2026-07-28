/*
 * Copyright (C) 2025 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MFEBaseModule } from '@acme-priv/ui-common/src/acme/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
	declarations: [AppComponent],
	imports: [CommonModule, MFEBaseModule, AppRoutingModule],
	bootstrap: [AppComponent]
})
export class AppModule {}

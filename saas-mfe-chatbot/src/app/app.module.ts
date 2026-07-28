/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MFEBaseModule } from '@acme-priv/ui-common/src/acme/angular';

import { AppComponent } from './app.component';
import { HarborPilotModule } from './harbor-pilot/harbor-pilot.module';
import { MarkdownModule } from 'ngx-markdown';

// @ts-ignore
@NgModule({
	declarations: [AppComponent],
	imports: [BrowserModule, BrowserAnimationsModule, MFEBaseModule, HarborPilotModule, MarkdownModule.forRoot()],
	bootstrap: [AppComponent]
})
export class AppModule {}

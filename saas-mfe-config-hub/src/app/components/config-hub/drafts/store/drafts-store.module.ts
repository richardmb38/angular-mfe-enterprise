/*
 * Copyright (C) 2023 Acme Technologies, Inc. All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { DraftsPageEffects } from './effects';
import { DraftsReducer } from './reducers';

import { DRAFTS_PAGE_FEATURE_KEY } from './states';

/**
 * Module encapsulating the Drafts Page store.
 */
@NgModule({
	imports: [
		CommonModule,
		StoreModule.forFeature(DRAFTS_PAGE_FEATURE_KEY, DraftsReducer),
		EffectsModule.forFeature([DraftsPageEffects])
	]
})
export class ConfigHubDraftsStoreModule {}

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { LocaleStaticLoaderModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/locale-static-loader';

import { MFEBaseModule } from '@acme-priv/ui-common/src/acme/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConfigHubModule } from './components/config-hub/config-hub.module';
import { StoreModule } from './store/store.module';

@NgModule({
	declarations: [AppComponent],
	imports: [
		LocaleStaticLoaderModule,
		BrowserModule,
		BrowserAnimationsModule,
		CommonModule,
		StoreModule,
		RouterModule,
		LoadingMaskModule,
		ConfigHubModule,
		MFEBaseModule,
		AppRoutingModule // This must always be the last import
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule {}

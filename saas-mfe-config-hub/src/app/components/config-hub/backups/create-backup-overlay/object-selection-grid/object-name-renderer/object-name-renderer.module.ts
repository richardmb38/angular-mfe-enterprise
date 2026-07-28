import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AgGridModule } from 'ag-grid-angular';

import { DynamicFormModule, TagService } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import { TagCollectionModule } from '@acme-priv/armada-angular/src/acme/angular/components/tag-collection';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { BackupsTagService } from '../../../../shared/services/backups/backups.tag.service';
import { ConfigHubObjectNameRendererComponent } from './object-name-renderer.component';

@NgModule({
	declarations: [ConfigHubObjectNameRendererComponent],
	imports: [CommonModule, TranslateModule, AgGridModule, DynamicFormModule, TagCollectionModule],
	exports: [ConfigHubObjectNameRendererComponent],
	providers: [{ provide: TagService, useClass: BackupsTagService }]
})
export class ObjectNameRendererModule {}

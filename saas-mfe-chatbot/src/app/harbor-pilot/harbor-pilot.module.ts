/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HarborPilotIconButtonComponent } from './components/harbor-pilot-icon-button/harbor-pilot-icon-button.component';
import { HarborPilotOverlayModule } from './components/harbor-pilot-overlay/harbor-pilot-overlay.module';
import { HarborPilotComponent } from './harbor-pilot.component';

@NgModule({
	imports: [CommonModule, HarborPilotOverlayModule, RouterOutlet, HarborPilotIconButtonComponent],
	declarations: [HarborPilotComponent],
	exports: [HarborPilotComponent]
})
export class HarborPilotModule {}

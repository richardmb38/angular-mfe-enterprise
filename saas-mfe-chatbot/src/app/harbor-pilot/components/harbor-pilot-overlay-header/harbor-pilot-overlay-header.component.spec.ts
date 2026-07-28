/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {
	IconArrowUpModule,
	IconBroomModule,
	IconCloseModule,
	IconCollapseWindowModule,
	IconDragHandleModule,
	IconExpandWindowModule,
	IconModule
} from '@acme-priv/armada-angular/src/acme/angular/components/icons';
import { TooltipModule } from '@acme-priv/armada-angular/src/acme/angular/components/tooltip';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { AppShellWrapperService } from '@acme-priv/ui-common/src/acme/angular/util/app-shell';

import { HarborPilotStore } from '../../harbor-pilot.store';
import { HarborPilotChatMessageModule } from '../harbor-pilot-chat-message/harbor-pilot-chat-message.module';
import { HarborPilotIconButtonComponent } from '../harbor-pilot-icon-button/harbor-pilot-icon-button.component';
import { HarborPilotPromptsModule } from '../harbor-pilot-prompts/harbor-pilot-prompts.module';
import { HarborPilotOverlayHeaderComponent } from './harbor-pilot-overlay-header.component';

describe('HarborPilotOverlayHeaderComponent', () => {
	let component: HarborPilotOverlayHeaderComponent;
	let fixture: ComponentFixture<HarborPilotOverlayHeaderComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [
				HarborPilotPromptsModule,
				HarborPilotIconButtonComponent,
				HarborPilotChatMessageModule,
				IconCloseModule,
				IconCollapseWindowModule,
				IconExpandWindowModule,
				IconBroomModule,
				IconDragHandleModule,
				IconArrowUpModule,
				IconModule,
				TooltipModule,
				TranslateModule.forRoot(),
				HttpClientTestingModule
			],
			declarations: [HarborPilotOverlayHeaderComponent],
			providers: [
				HarborPilotStore,
				{
					provide: AppShellWrapperService,
					useValue: {
						getUserContextV1: () => ({
							displayName: 'Test User'
						}),
						isMFE: () => false
					}
				}
			]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(HarborPilotOverlayHeaderComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('onExpandClick', () => {
		it('should update expand value', () => {
			component.expanded.set(false);
			component.onExpandClick();
			expect(component.expanded()).toEqual(true);
		});
	});

	describe('onCloseClick', () => {
		it('should emit dismiss', () => {
			jest.spyOn(component.dismiss, 'emit');
			component.onCloseClick();
			expect(component.dismiss.emit).toHaveBeenCalled();
		});
	});
});

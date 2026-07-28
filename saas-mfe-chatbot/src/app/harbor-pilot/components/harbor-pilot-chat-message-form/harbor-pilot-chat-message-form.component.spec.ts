import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';

import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { HarborPilotStore } from '../../harbor-pilot.store';
import { HarborPilotChatMessageFormComponent } from './harbor-pilot-chat-message-form.component';

describe('HarborPilotChatMessageFormComponent', () => {
	let harborPilotStore: HarborPilotStore;

	let component: HarborPilotChatMessageFormComponent;
	let fixture: ComponentFixture<HarborPilotChatMessageFormComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule, TranslateModule.forRoot()],
			declarations: [HarborPilotChatMessageFormComponent],
			providers: [HarborPilotStore]
		});

		harborPilotStore = TestBed.inject(HarborPilotStore);

		fixture = TestBed.createComponent(HarborPilotChatMessageFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('onInputChange', () => {
		it('should set message with the new value', () => {
			component.onInputChange('TestValue');
			expect(component.message).toEqual('TestValue');
		});
	});

	describe('onTextAreaKeydown', () => {
		it('should add a line break to the message if user is holding ctrl or shift and presses enter', () => {
			component.message = 'TestMessage';
			component.onTextAreaKeydown({ ctrlKey: true, key: 'Enter' } as never);
			expect(component.message).toEqual('TestMessage\n');

			component.message = 'TestMessage';
			component.onTextAreaKeydown({ shiftKey: true, key: 'Enter' } as never);
			expect(component.message).toEqual('TestMessage\n');
		});

		it('should send message if user presses Enter', fakeAsync(() => {
			const testMessage = 'TestMessage';
			component.message = testMessage;
			component.onTextAreaKeydown({ key: 'Enter', preventDefault: jest.fn() } as never);
			expect(component.message).toEqual('');

			flush();
		}));
	});

	describe('onActionButtonClick', () => {
		it('should handle the action button click accordingly tot the cancel and send actions', () => {
			const cancelSubmitMessageSpy = jest.spyOn(component as never, 'cancelSubmitMessage');
			const submitMessageSpy = jest.spyOn(component as never, 'submitMessage');

			component.onActionButtonClick();
			expect(submitMessageSpy).toHaveBeenCalled();

			component.isMessageLoading = true;
			component.onActionButtonClick();
			expect(cancelSubmitMessageSpy).toHaveBeenCalled();
		});
	});

	describe('onClearChatClick', () => {
		it('should call start new session in message service', () => {
			jest.spyOn(harborPilotStore, 'startNewSession');
			component.onClearChatClick();
			harborPilotStore.selectMessages$.subscribe(messages => {
				expect(messages).toEqual([]);
			});
		});
	});
});

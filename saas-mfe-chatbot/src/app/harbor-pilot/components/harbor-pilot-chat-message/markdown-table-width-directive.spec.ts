/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { MarkdownTableWidthDirective } from './markdown-table-width-directive';

describe('MarkdownTableWidthDirective', () => {
	let directive: MarkdownTableWidthDirective;
	let elementRefMock;
	let classListMock;

	beforeEach(() => {
		classListMock = {
			contains: jest.fn(() => false),
			add: jest.fn()
		};

		elementRefMock = {
			nativeElement: {
				parentElement: {
					classList: classListMock,
					constructor: {
						contains: jest.fn(() => false)
					}
				},
				innerHTML: ''
			}
		};

		directive = new MarkdownTableWidthDirective(elementRefMock);
	});

	it('should apply harbor-pilot-chat-message--table-width when markdown contains table', () => {
		elementRefMock.nativeElement.innerHTML = '<table><tr><td>Test</td></tr></table>';

		directive.ngAfterViewInit();

		expect(classListMock.add).toHaveBeenCalledWith('harbor-pilot-chat-message--table-width');
	});

	it('should apply harbor-pilot-chat-message--text-width when markdown contains table', () => {
		elementRefMock.nativeElement.innerHTML = '<p>Test</p>';

		directive.ngAfterViewInit();

		expect(classListMock.add).toHaveBeenCalledWith('harbor-pilot-chat-message--text-width');
	});
});

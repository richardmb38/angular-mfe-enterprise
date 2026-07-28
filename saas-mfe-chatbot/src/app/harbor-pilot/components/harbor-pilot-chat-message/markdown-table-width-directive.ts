/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { AfterViewInit, Directive, ElementRef } from '@angular/core';

/**
 * Directive to conditionally apply CSS classes to the parent element of the markdown component based on whether the
 * markdown content contains a table.
 *
 * @directive MarkdownTableWidthDirective
 *
 * @selector appMarkdownTableWidth
 */
@Directive({
	standalone: true,
	selector: '[appMarkdownTableWidth]'
})
export class MarkdownTableWidthDirective implements AfterViewInit {
	constructor(private elementRef: ElementRef) {}

	/**
	 * Lifecycle hook that checks the rendered markdown content and applies CSS classes to the parent element
	 */
	ngAfterViewInit(): void {
		const markdownContent = this.elementRef.nativeElement.innerHTML;
		if (markdownContent.includes('<table')) {
			this.elementRef.nativeElement.parentElement.classList.add('harbor-pilot-chat-message--table-width');
		} else {
			this.elementRef.nativeElement.parentElement.classList.add('harbor-pilot-chat-message--text-width');
		}
	}
}

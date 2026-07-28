/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { ProductFlags } from 'app/product-flags.enum';

/**
 * Generative AI Tools used in Harbor Pilot.
 */
export enum Tools {
	ADMIN_SEARCH = 'admin-search',
	ACME_DOC = 'acme-doc',
	WORKFLOW_BUILDER = 'workflow-builder',
	// also known as general tool on the BE, its a fallback tool for when no other tool matches the user prompt context.
	// TODO: remove this when the BE is updated to not require a fallback tool MOON_371_HARBOR_PILOT_GENERAL_TOOL.
	FALLBACK_TOOL = 'fallback-tool'
}

/**
 * Harbor Pilot prompt category model.
 */
export interface HarborPilotPromptCategory {
	id: string;
	title?: string;
	message: string;
	iconName: string;
	iconFill?: string;
	prompt: string;
	tools: Tools[];
	license: ProductFlags;
}

/**
 * Prompt categories mapped to their respective tools.
 */
export const HARBOR_PILOT_PROMPT_CATEGORIES_MAP: Map<string, HarborPilotPromptCategory> = new Map([
	[
		Tools.ACME_DOC,
		{
			id: 'acme-doc',
			title: 'CHATBOT.TOOLS.ACME_DOC.TITLE',
			message: 'CHATBOT.TOOLS.ACME_DOC.USER_PROMPT',
			prompt: 'CHATBOT.TOOLS.ACME_DOC.BOT_PROMPT',
			tools: [Tools.ACME_DOC],
			iconName: 'brain',
			iconFill: 'p4l',
			license: ProductFlags.AGENTIC_BOT_BASE
		}
	],
	[
		Tools.ADMIN_SEARCH,
		{
			id: 'admin-search',
			title: 'CHATBOT.TOOLS.ADMIN_SEARCH.TITLE',
			message: 'CHATBOT.TOOLS.ADMIN_SEARCH.USER_PROMPT',
			prompt: 'CHATBOT.TOOLS.ADMIN_SEARCH.BOT_PROMPT',
			tools: [Tools.ADMIN_SEARCH],
			iconName: 'telescope',
			iconFill: 'a2',
			license: ProductFlags.AGENTIC_BOT_NL_SEARCH
		}
	],
	[
		Tools.WORKFLOW_BUILDER,
		{
			id: 'workflow-builder',
			title: 'CHATBOT.TOOLS.WORKFLOW_BUILDER.TITLE',
			message: 'CHATBOT.TOOLS.WORKFLOW_BUILDER.USER_PROMPT',
			prompt: 'CHATBOT.TOOLS.WORKFLOW_BUILDER.BOT_PROMPT',
			tools: [Tools.WORKFLOW_BUILDER],
			iconName: 'bolt',
			iconFill: 'p2',
			license: ProductFlags.AGENTIC_BOT_WORKFLOWS_GENERATOR
		}
	]
]);

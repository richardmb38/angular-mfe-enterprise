/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */

/**
 * All the Feature Flags in Chatbot MFE
 */
export enum FeatureFlags {
	// This feature flag is used to enable the chatbot.
	HARBOR_PILOT_SAFELIST = 'HARBOR_PILOT_SAFELIST',
	// This feature flag is used to enable the auto tool selection in the chatbot.
	// TODO: Remove HARBOR_PILOT_INTELLIGENT_TOOL feature flag check once the feature is enabled for all users.
	HARBOR_PILOT_INTELLIGENT_TOOL = 'HARBOR_PILOT_INTELIGENT_TOOL',
	// This feature flag is used to display the debugger IDs in the chatbot messages.
	UIDATA1115_HARBOR_PILOT_DEBUGGER = 'UIDATA1115_HARBOR_PILOT_DEBUGGER',
	// This feature flag is used to turn on the evaluation of the Product Flags and Licenses in the chatbot.
	MOON_632_HARBOR_PILOT_PRODUCT_FLAGS = 'MOON_632_HARBOR_PILOT_PRODUCT_FLAGS'
}

/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { ConfigHubModeType } from './job.model';

/**
 * Format of resolver URLs for Object Configurations
 */
export interface ConfigHubConfigUrl {
	/**
	 * URL for the target object endpoint.
	 */
	url?: string;
	/**
	 * Any query parameters that are needed for the URL.
	 */
	query?: object | null;
}

/**
 * Format of rules for Configuration Objects
 */
export interface ConfigHubObjectRule {
	path: string;
	value?: any;
	mode: Array<ConfigHubModeType>;
}

/**
 * Sets of rules for Configuration Objects
 */
export interface ConfigHubObjectRules {
	takeFromTargetRules?: Array<ConfigHubObjectRule>;
	defaultRules?: Array<ConfigHubObjectRule>;
	editable?: boolean;
}
/**
 * Defines a configuration object type as expected to be received from the API.
 */
export interface ConfigHubBackupObjectType {
	/**
	 * The object type this configuration is for.
	 */
	objectType: string;
	/**
	 * Url to export this type of object.
	 */
	exportUrl?: string | ConfigHubConfigUrl;
	/**
	 * If true, object can be imported through the legacy /import endpoint.
	 */
	legacyObject?: boolean;
	/**
	 * If true, this object type can be exported
	 */
	exportable?: boolean;
	/**
	 * List of json paths within an exported object of this type that represent references that need to be resolved.
	 */
	referenceExtractors?: Array<string> | null;
	/**
	 * If true, this type of object will be JWS signed and cannot be modified before import.
	 */
	signatureRequired?: boolean;
	/**
	 * Lists of rules to be applied during draft process
	 */
	rules?: ConfigHubObjectRules;
}

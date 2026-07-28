/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Operation as JSONPatchOperation } from 'fast-json-patch';

/**
 * The type of object operation.
 */
export enum ObjectOperationType {
	ADDED = 'ADDED',
	CHANGED = 'CHANGED',
	REMOVED = 'REMOVED'
}

/**
 * Base interface containing items common to all IDN objects.
 */
export interface BaseObject {
	/**
	 * The id of the object.
	 */
	id: string;

	/**
	 * The name of the object.
	 */
	name: string;

	/**
	 * An index signature allowing additinoal attributes on the object.
	 */
	[key: string]: any;
}

/**
 * A base DTO for references to other objects.
 *
 * Mirrored from cloud-api-client-common.
 * See: https://github.com/acme/cloud-api-client-common/blob/master/api-client-common/src/main/java/com/acme/cloud/api/client/model/BaseReferenceDto.java
 */
export interface BaseReferenceDto {
	/**
	 * The id of the object.
	 */
	id: string;

	/**
	 * The type of object.
	 */
	type: string;

	/**
	 * The name of the object.
	 */
	name: string;
}

/**
 * Base interface containing items common to all import objects.
 *
 * Mirrored from saas-sp-config
 * See: https://github.com/acme/saas-sp-config/blob/master/sp-config-domain/src/main/java/com/acme/config/domain/ImportObject.java
 */
export interface ImportObject {
	/**
	 * Version number
	 */
	version: number;

	/**
	 * A DTO containing object metadata.
	 */
	self: BaseReferenceDto;

	/**
	 * The object itself.
	 */
	object: BaseObject;
}

/**
 * A signed version of an ImportObject.
 *
 * Mirrored from saas-sp-config
 * See: https://github.com/acme/saas-sp-config/blob/master/sp-config-domain/src/main/java/com/acme/config/domain/SignedImportObject.java
 */
export interface SignedImportObject extends ImportObject {
	/**
	 * The signing header for the SignedImportObject.
	 */
	jwsHeader: string;
	/**
	 * The signature signing the SignedImportObject.
	 */
	jwsSignature: string;
}

/**
 * Details of a specific object of a given type contained in a backup or draft.
 */
export interface ObjectDetails {
	/**
	 * Name of the tenant where this object originated.
	 */
	tenant?: string;

	/**
	 * The id of the associated job.
	 */
	jobId: string;

	/**
	 * The type of object.
	 */
	objectType: string;

	/**
	 * The id of the object.
	 */
	objectId: string;

	/**
	 * The name of the object.
	 */
	objectName: string;

	/**
	 * The object itself.
	 */
	object: SignedImportObject;

	/**
	 * The object from the live configuration.
	 */
	liveObject?: SignedImportObject;

	/**
	 * The type of operation being performed on this object.
	 */
	operation: ObjectOperationType;

	/**
	 * The JSON patch array containing changes to the object.
	 * Only applies if operation === ObjectOperationType.CHANGED
	 */
	jsonPatch?: JSONPatchOperation[];

	/**
	 * Whether or not the object has known errors.
	 */
	hasErrors: boolean;

	/**
	 * The error message if hasErrors === true.
	 */
	message?: string;

	/**
	 * A list containing all the metadata modifications performed on the object.
	 */
	appliedModificationMetadata?: Array<ConfigHubModificationMetadata>;
}

/**
 * Parsed message from object details
 */
export interface ObjectDetailMessage {
	key: string;
	text: string;
}

/**
 * A model for the expected API response from the objects list endpoint.
 */
export interface ObjectDetailsListResponse {
	/**
	 * An array of ObjectDetails.
	 */
	items: ObjectDetails[];

	/**
	 * The token to be passed as `lastEvaluatedKey` to retrieve the next page of results.
	 */
	nextToken?: string;
}

/**
 * A model for a dictionary of objectIds to their corresponding JSON patch operations.
 */
export interface BaseObjectPatchDictionary {
	[objectId: string]: JSONPatchOperation[];
}

/**
 * The API payload to deliver when bulk deleting objects from a draft.
 */
export interface BaseObjectDeletePayload {
	objectIdsToDelete: string[];
	typesToDelete: string[];
	objectsToDelete: {};
}

/**
 * The model for the API response when retrieving the live configuration for an object
 */
export interface ConfigHubObjectConfigurationResult {
	/**
	 * The id of the target backup
	 */
	jobId: string;

	/**
	 * The object type that the object belongs to
	 */
	objectType: string;

	/**
	 * The id of the object
	 */
	objectId: string;

	/**
	 * The name of the object
	 */
	objectName: string;

	/**
	 * A string containing the JSON configuration for the object
	 */
	object: string;
}

/**
 * Config Hub object details overlay tabs enum
 */
export enum ConfigHubObjectTabs {
	EDIT = 0,
	CHANGELOG = 1,
	RULES = 2,
	JSON = 3,
	ISSUES = 4
}

/**
 * JSON patch operation types
 */
export enum ConfigHubPatchOperations {
	REPLACE = 'replace',
	ADD = 'add',
	MOVE = 'move',
	COPY = 'copy',
	REMOVE = 'remove'
}

/**
 * Object single tab props
 */
export interface ConfigHubObjectTab {
	title: string;
	withIcon: boolean;
	index: ConfigHubObjectTabs;
}

/**
 * A model for the appliedModificationMetadata property in the object details response
 */
export interface ConfigHubModificationMetadata {
	/**
	 * The path that the modification is applied to
	 */
	attributePath: string;

	/**
	 * The type of modification
	 */
	modificationType: string;

	/**
	 * The new value resulting from the modification
	 */
	newValue: Object | string | boolean;

	/**
	 * The original value prior to the modification
	 */
	oldValue: {
		value: Object | string | boolean;
	};
}

/*
 * Copyright (C) 2025 Acme Technologies, Inc.  All rights reserved.
 */
import enAcme from '../node_modules/@acme-priv/armada-angular/src/acme/messages/ACME.json';
import enIdentityNow from '../node_modules/@acme-priv/ui-common/src/acme/messages/IDENTITYNOW.json';
import enAccessRequest from '../src/messages/ACCESSREQUEST.json';

export const translations = {
	en: {
		...enIdentityNow,
		...enAcme,
		...enAccessRequest
	}
};

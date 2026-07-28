/*
 * Copyright (C) 2023 Acme Technologies, Inc. All rights reserved.
 */
'use strict';

const s3UploadService = require('../lib/util/s3UploadService.js');

const uploadPromise = s3UploadService.uploadStatic();

uploadPromise.catch(err => {
	console.error(err);
	process.exit(1);
});

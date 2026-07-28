/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { addArmadaCommands } from '@acme-priv/armada-angular/src/acme/cypress/shared/commands';

import { addCommonCommands } from '@acme-priv/ui-common/src/acme/cypress/shared/commands';

import '@testing-library/cypress/add-commands';
import 'cypress-file-upload';
import compareSnapshotCommand from 'cypress-visual-regression/dist/command';

compareSnapshotCommand();
addArmadaCommands();
addCommonCommands();

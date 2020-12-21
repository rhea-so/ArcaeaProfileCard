require('app-module-path').addPath(__dirname);
require('source-map-support').install();

import { Debug, LogTag } from 'Utils/debugTool';

Debug.log(LogTag.NOWAY, 'test.ts');

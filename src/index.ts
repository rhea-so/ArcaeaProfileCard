require('app-module-path').addPath(__dirname);
require('source-map-support').install();

import Runtime from 'rhea-runtime';

import { Debug, LogTag } from 'Utils/debugTool';

async function main() {
	Debug.log(LogTag.NOWAY, 'Hello, World!');
	await Runtime.boot();
	Runtime.get('/', async (req, res) => {
		res.send('Hello, World!');
	});
	await Runtime.open();
}

main();

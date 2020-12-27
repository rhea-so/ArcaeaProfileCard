require('app-module-path').addPath(__dirname);
require('source-map-support').install();

import Runtime from 'rhea-runtime';
import request from 'request';
import { ArcaeaMember } from 'arcaea-crawler';
const pureimage = require('pureimage'); 
const jpeg = require('jpeg-js');
const eventLine = new EventMutex();
import EventMutex from 'event-mutex';

async function healthCheck(): Promise<void> {
	return new Promise((resolve, reject) => {
		request.get('https://arcapi.lowiro.com/', (err, response, body) => {
			console.log('[err] :', err);
			console.log('[response] :', response.statusCode);
			console.log('[body] :', body);
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}

async function main() {
	await Runtime.boot();
	Runtime.get('/', async (req, res) => {
		res.send('Hello, World!');
	});

	// ARCAEA SITE Health Check
	await healthCheck();


	const user = new arcaea("11bf5b37-e0b8-42e0-8dcf-dc8c4aefc001");
	try { 
		user.requester.headers.AppVersion = '3.4.0';
		user.login('tester2234', 'tester223344');
	} catch(err) {
		Runtime.kill(err);
		console.log(err);
	}

	
	Runtime.get('/recent', async (req, res) => {
		eventLine.push({
			execution: async () => {
				if (!!req.query.id === false) {
					res.send('Error');
					return;
				}

			try {
				const friend = (await user.addFriend(Number(req.query.id))).friends[0].user_id;
				const data = (await user.getInfo()).friends[0];
				const recentScore = data.recent_score[0];
				await user.delFriend(friend);

				// Draw start to use pureimage!  
				const bitmap = pureimage.make(320, 150);
				const ctx = bitmap.getContext('2d');
				const fnt = pureimage.registerFont('SourceSansPro-Regular.ttf','Source Sans Pro');
				fnt.load(() => {
					ctx.fillStyle = '#ffffff';
					ctx.font = "22pt 'Source Sans Pro'";
					ctx.fillText(data.name, 10, 25);
					ctx.font = "18pt 'Source Sans Pro'";
					ctx.fillText(String(data.rating).slice(0, 2) + '.' + String(data.rating).slice(2, 4), 100, 25);
					let difficulty = 'past';
					switch(recentScore.difficulty) {
						case 1:
							difficulty = 'present';
							 break;
						case 2:
							difficulty = 'future';
							break;
						case 3:
							difficulty = 'beyond';
							break;
					}
					ctx.fillText(' ' + recentScore.song_id + ' - ' + difficulty, 10, 45);
					ctx.font = "15pt 'Source Sans Pro'";
					const date = (new Date(recentScore.time_played));
					ctx.fillText( date.getFullYear() + '.' + ("0" + (date.getMonth() + 1)).slice(-2)  + '.' + ("0" + date.getDate()).slice(-2) + ' ' + ("0" + date.getHours() + 1 ).slice(-2) + ':' + ("0" + date.getMinutes()).slice(-2) + ':' + ("0" + date.getSeconds()).slice(-2), 185, 23);
					ctx.font = "45pt 'Source Sans Pro'";
					ctx.fillText(String(recentScore.score), 20, 90);
					ctx.font = "15pt 'Source Sans Pro'";
					ctx.fillText('PURE : ' + recentScore.perfect_count, 210, 65);
					ctx.fillText('FAR : ' + recentScore.near_count, 210, 80);
					ctx.fillText('LOST : ' + recentScore.miss_count, 210, 95);
					ctx.fillText('RAITING : ' + recentScore.rating, 10, 140);
					ctx.fillRect(15, 100, 15+150, 10);
					ctx.fillStyle = '#000000';
					ctx.fillRect(17, 102, 15+146, 6);
					ctx.fillStyle = '#ffffff';
					ctx.fillRect(15, 100, 15+(150/100)*recentScore.health, 10);

					// Convert and send!
					const img = Buffer.from(jpeg.encode({ data: bitmap.data, width: bitmap.width, height: bitmap.height }, 50).data, 'base64');
					res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Content-Length': img.length });
					res.end(img);
				});
			} catch(error) {
				console.log(error);
				res.send('Error');
				return;
			}
		}, data: {});

	await Runtime.open();
}

main().then().catch(err => { Runtime.kill(err); });

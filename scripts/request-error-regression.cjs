const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const express = require('express');
const request = require('supertest');

async function checkBoundary(source) {
	const filename = path.resolve(source);
	const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
		compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
	}).outputText;
	const loaded = new Module(filename, module);
	loaded.filename = filename;
	loaded.paths = Module._nodeModulePaths(path.dirname(filename));
	loaded._compile(compiled, filename);
	const { asyncHandler, requestErrorHandler } = loaded.exports;
	const app = express();
	app.use(express.json());
	app.get('/sync', asyncHandler(() => { throw new Error('sync failure'); }));
	app.get('/async', asyncHandler(async () => {
		await Promise.resolve();
		throw new Error('async failure');
	}));
	app.get('/middleware', asyncHandler(async () => {
		throw new Error('middleware failure');
	}), (_req, res) => res.sendStatus(200));
	app.post('/json', asyncHandler(async (_req, res) => res.sendStatus(200)));
	app.get('/healthy', (_req, res) => res.json({ ok: true }));
	app.use(requestErrorHandler);
	for (const route of ['/sync', '/async', '/middleware']) {
		await request(app).get(route).expect(500);
		await request(app).get('/healthy').expect(200);
	}
	await request(app).post('/json').set('Content-Type', 'application/json').send('{').expect(400);
	const healthy = await request(app).get('/healthy').expect(200);
	assert.equal(healthy.body.ok, true);
	console.log(`PASS ${source}: sync/async/middleware errors, malformed JSON, subsequent requests`);
}

(async () => {
	await checkBoundary('src/requestErrors.ts');
	for (const service of fs.readdirSync('services')) {
		const source = `services/${service}/src/requestErrors.ts`;
		if (fs.existsSync(source)) await checkBoundary(source);
	}
})().catch(error => { console.error(error); process.exitCode = 1; });

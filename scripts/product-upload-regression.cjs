// Run in the rebuilt catalog container:
// docker compose exec -T catalog-service node < scripts/product-upload-regression.cjs
const assert = require('node:assert/strict');
const express = require('express');
const cloudinary = require('./dist/helpers/cloudinary').default;
const { parseProductUpload, prepareProductImages } = require('./dist/productUpload');
const { requestErrorHandler } = require('./dist/requestErrors');

(async () => {
	// This isolated test mocks the provider; it needs no real credentials.
	process.env.ENABLE_CLOUDINARY = 'true';
	process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
	process.env.CLOUDINARY_API_KEY = 'test-key';
	process.env.CLOUDINARY_API_SECRET = 'test-secret';
	let uploads = 0;
	let failUpload = false;
	cloudinary.uploader.upload = async () => {
		uploads++;
		if (failUpload) throw new Error('Simulated provider failure');
		return { secure_url: 'https://example.com/product.png', public_id: 'test-image' };
	};
	const app = express();
	app.use(express.json());
	app.post('/products', parseProductUpload, prepareProductImages(), (req, res) => res.status(201).json(req.body));
	app.patch('/products', parseProductUpload, prepareProductImages(true), (req, res) => res.json(req.body));
	app.get('/health', (_req, res) => res.sendStatus(200));
	app.use(requestErrorHandler);
	const server = app.listen(0, '127.0.0.1');
	await new Promise(resolve => server.once('listening', resolve));
	const base = `http://127.0.0.1:${server.address().port}`;
	function form(type = 'image/png', complete = true) {
		const data = new FormData();
		if (complete) {
			for (const [key, value] of Object.entries({ name: 'Multipart product', price: '45000', quantity: '3', discount: '10', categoryId: 'cdd63048-b34b-40f2-8435-40182ed2e395', expiryDate: '2099-01-01' })) data.append(key, value);
		}
		data.append('images', new Blob(['test-image'], { type }), 'product.png');
		return data;
	}
	try {
		let response = await fetch(base + '/products', { method: 'POST', body: form() });
		assert.equal(response.status, 201);
		const product = await response.json();
		assert.equal(product.name, 'Multipart product');
		assert.equal(product.price, 45000);
		assert.equal(product.quantity, 3);
		assert.deepEqual(product.images, ['https://example.com/product.png']);
		console.log('PASS: multipart fields converted and uploaded URLs supplied');
		response = await fetch(base + '/products', { method: 'POST', body: form('image/png', false) });
		assert.equal(response.status, 400);
		assert.equal(uploads, 1);
		console.log('PASS: invalid product rejected before upload');
		response = await fetch(base + '/products', { method: 'POST', body: form('text/plain') });
		assert.equal(response.status, 400);
		console.log('PASS: unsupported upload rejected');
		response = await fetch(base + '/products', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: '959da3e7-f334-434d-b355-845e0db461cc', name: 'Updated name' }) });
		assert.equal(response.status, 200);
		const updated = await response.json();
		assert.equal(updated.images, undefined);
		assert.equal(updated.id, undefined);
		console.log('PASS: editing fields preserves existing images');
		const updateForm = new FormData();
		updateForm.append('id', '959da3e7-f334-434d-b355-845e0db461cc');
		updateForm.append('name', 'Multipart update');
		response = await fetch(base + '/products', { method: 'PATCH', body: updateForm });
		assert.equal(response.status, 200);
		const multipartUpdate = await response.json();
		assert.equal(multipartUpdate.name, 'Multipart update');
		assert.equal(multipartUpdate.id, undefined);
		console.log('PASS: multipart update accepts redundant id without making it editable');
		failUpload = true;
		response = await fetch(base + '/products', { method: 'POST', body: form() });
		assert.equal(response.status, 502);
		assert.equal((await fetch(base + '/health')).status, 200);
		console.log('PASS: provider failure returns 502 and server stays healthy');
	} finally {
		server.closeAllConnections();
		await new Promise(resolve => server.close(resolve));
	}
})().catch(error => { console.error(error); process.exitCode = 1; });

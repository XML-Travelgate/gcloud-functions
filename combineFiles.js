const async = require('asyncawait/async');
const await = require('asyncawait/await');
const gcloud = require('google-cloud');
const gcs = gcloud.storage()
var bucket = null;

exports.combineFiles = function combineFiles(req, res) {

	const date = req.query.date || new Date();
	const days = req.query.days || 30;
	const prefix = req.query.prefix;
	let path = req.query.path;
	const bucketName = req.query.bucketName;
	const header_file = req.query.headerFile

	if (!prefix || !bucketName || !path || !header_file) {
		res.status(400).send('prefix, path, bucketName, headerFile are mandatory');
		return;
	}


	if (typeof (path) === 'string') {
		console.log('path is not an array, converting...')
		path = [path]
	}

	foo(date, days, path, prefix, bucketName, header_file)
		.then(url => {
			res.writeHead(302, {'Location':url});
			res.end();
		})
		.catch(err => res.status(200).send(err))

};

const foo =
	async((date, days, path, prefix, bucketName, header_file) => {

		bucket = gcs.bucket(bucketName)

		let names = nameFiles(date, days, path, prefix);
		console.log('fileNames asked:', names.length)

		let f = []
		path.forEach(p => f.push(getFiles(p)))
		let files = await(promiseAll(f))

		let tmp = files.reduce((p, c, i, a) => p.concat(c))
		files = tmp;

		files = files.filter(file => names.indexOf(file.name) > -1)

		console.log('files found:', files.length)

		const combined = []
		const loops = Math.ceil(files.length / 30);
		console.log("loops: ", loops)
		for (let i = 0; i < loops; i++) {
			let items = files.slice(30 * i, 30 * i + 30)
			combined.push(combine(items, `tmp/${guid()}`))
		}

		let p = await(promiseAll(combined))

		let headers = bucket.file(header_file)
		console.log("header file:", headers.name)
		p.unshift(headers)
		let finalFile = await(combine(p, `tmp/${guid()}.csv`))

		console.log("name:", finalFile.name)
		await(publicFile(finalFile))

		const url = `https://storage.googleapis.com/${bucketName}/${finalFile.name}`
		console.log('url:', url)
		return url;

	})



function getFiles(prefix) {
	return new Promise((resolve, reject) => {
		bucket.getFiles({ prefix: prefix }, (err, files) => {
			if (!err) {
				resolve(files)
			} else {
				console.log(err)
			}
		})
	})
}

function combine(files, destination) {
	return new Promise((resolve, reject) => {
		bucket.combine(files, destination, (err, newFile, apiResponse) => {
			if (!err) {
				resolve(newFile);
			} else {
				console.log(err)
			}
		})
	})
}

function nameFiles(date, days, path, prefix) {
	const fn = [];

	path.forEach(name => {
		for (let i = 0; i < days; i++) {
			let d = new Date(date)
			d.setDate(d.getDate() - i)
			d = d.toISOString().slice(0, 10)
			fn.push(`${name}${prefix}${d}.csv`)
		}
	})
	return fn;
}

function promiseAll(array) {
	return Promise.all(array);
}

function guid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function publicFile(file) {
	return new Promise((resolve, reject) => {
		file.makePublic(((err, apiResponse) => {
			if (!err) {
				resolve()
			} else {
				console.log(err)
			}
		}))
	})
}

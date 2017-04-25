const gcs = require('@google-cloud/storage')();

// const gcs = require('@google-cloud/storage')({
// 	projectId: 'axiomatic-port-796',
// 	keyFilename: 'key-axiomatic.json'
// });

const async = require('asyncawait/async');
const await = require('asyncawait/await');
const csv = require('fast-csv');

exports.appendFilesV2 = function appendFilesV2(req, res) {
	try {
		const date = req.query.date || new Date().toISOString().slice(0, 10);
		const days = req.query.days || 30
		const bucketName = req.query.bucketName
		const prefix = req.query.prefix

		const bucket = gcs.bucket(bucketName);

		const start = new Date();
		console.log(`New request: \nDate: ${date} \nDays: ${days} \nBucketName: ${bucketName} \nPrefix: ${prefix}`)

		const requiredFiles = requestFileNameFromDate(date, days, prefix)
		getDataFromFiles(prefix, requiredFiles, bucket)
			.then(data => {
				data = data.reduce((prev, curr) => prev.concat(curr), [])
				csv.writeToStream(res, data, { headers: true })
				console.log(`Total Time: ${diffBetweenDates(start)}`)
			})
			.catch(error => {
				console.log(`getDataFromFiles Error: `, error)
				console.log(`Total Time: ${diffBetweenDates(start)}`)
			})

	} catch (error) {
		console.log(`Function error: `, error)
		console.log(`Total Time: ${diffBetweenDates(start)}`)
	}

}

const getDataFromFiles = async((prefix, requiredFiles, bucket) => {
	const files = await(bucket.getFiles({ prefix: prefix }))[0];
	const filesFiltered = files.filter(file => requiredFiles.indexOf(file.name) != -1);
	console.log(`Files found: ${filesFiltered.length}`)
	const readingPromises = filesFiltered.map(readStreamToJsonObject)
	return await(Promise.all(readingPromises));
})

function readStreamToJsonObject(file) {
	return new Promise((resolve, reject) => {
		const data = [];
		file.createReadStream()
			.pipe(csv({ objectMode: true, headers: true }))
			.on('data', record => data.push(record))
			.on('error', error => reject(error))
			.on('end', () => resolve(data))
	})
}

function requestFileNameFromDate(date, days, prefix) {

	const files = [];

	for (let i = 0; i < days; i++) {
		let d = new Date(date)
		d.setDate(d.getDate() - i)
		d = d.toISOString().slice(0, 10);
		files.push(`${prefix}${d}.csv`)
	}

	console.log(`Files required: ${files.length}`)

	return files;

}

function diffBetweenDates(start) {
	const end = new Date();
	return Math.abs(end.getTime() - start.getTime());
}
const { EOL } = require('os');
const fs = require('fs');
const path = require('path');

let latencyRegex = /latency:\s+(\d{1,3}\.\d{1,2})/gi;
let downloadRegex = /download:\s+(\d{1,3}\.\d{1,2})/gi;
let uploadRegex = /upload:\s+(\d{1,3}\.\d{1,2})/gi;
let lossRegex = /loss:\s+(\d{1,3}\.\d{1,2}|\w+)/gi;
let timeRegex = /(\w{3} \d{1,2} \w{3} \d{2}:\d{2}:\d{2} EAT \d{4})/gi;
let urlRegex = /url:\s+(\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b)/gi;
let lastIndex = 0;

const outputStream = fs.createWriteStream(path.join(__dirname, 'output')).setDefaultEncoding('utf-8');
outputStream.write('date,latency,download,upload,loss');
outputStream.write(EOL);
const inputStream = fs.createReadStream(path.join(__dirname, 'result')).setEncoding('utf-8');
inputStream.on('data', (chunk) => {
	let text = Buffer.from(chunk).toString('utf-8');

	let res = [ ...text.matchAll(urlRegex) ];
	if (res.length == 0) return;
	let lastElement = res[res.length - 1];
	let currentLastIndex = lastElement[0].length + lastElement.index;
	lastIndex += currentLastIndex;
	let data = [];

	[ timeRegex, latencyRegex, downloadRegex, uploadRegex, lossRegex ].forEach((regex) =>
		populateData(text, regex, currentLastIndex, data)
	);

	// Write data to file
	outputStream.write(data.flatMap((element) => element.join()).join(EOL));

	// If out of bounds, flush back to readstream
	if (chunk.length - currentLastIndex > 0) inputStream.unshift(text.substring(currentLastIndex), 'utf-8');
});

inputStream.on('end', () => {
	inputStream.close();
	outputStream.close();
});

inputStream.on('error', console.log);

function populateData(text, regex, lastIndex, data) {
	let index = 0;
	for (let match of text.matchAll(regex)) {
		let element = match[1];
		if (match.index > lastIndex) break;
		if (!data[index]) data.push([]);
		if (regex == lossRegex && isNaN(element)) element = 0;
		data[index++].push(element);
	}
}

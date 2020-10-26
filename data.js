let colors = [ '#003f5c', '#7a5195', '#ef5675', '#ffa600' ];
let labels = [ 'Download (Mbps)', 'Upload (Mbps)', 'Latency (ms)', 'Loss (%)' ];
let width = getWidth();
let height = getHeight();

let margin = { top: 10, right: 30, bottom: 30, left: 80 };

let axleHeight = height * 0.8;
let axleWidth = width;
d3.csv(
	'output',
	function(d) {
		return {
			x : d3.timeParse('%a %d %b %H:%M:%S EAT %Y')(d.date),
			y : [ d.download, d.upload, d.latency, d.loss ]
		};
	},
	function(data) {
		let x = d3.scaleTime().domain(d3.extent(data, (d) => d.x)).range([ 0, axleWidth ]);
		for (let index = 0; index < colors.length; index += 1) {
			let svg = d3
				.select(`#data${index}`)
				.append('svg')
				.attr('width', width - margin.left)
				.attr('height', height - margin.top - margin.bottom)
				.append('g')
				.attr('transform', `translate(${margin.left}, ${margin.top})`);
			svg.append('g').attr('transform', `translate(0, ${axleHeight})`).call(d3.axisBottom(x));

			let timeLabelX = (axleWidth - margin.right - margin.left) / 2;
			let timeLabelY = axleHeight * 1.1;
			svg
				.append('text')
				.attr('transform', `translate(${timeLabelX}, ${timeLabelY})`)
				.style('text-anchor', 'middle')
				.text('Time');

			let y = d3.scaleLinear().domain([ 0, d3.max(data, (d) => +d.y[index]) ]).range([ axleHeight, 0 ]);
			svg.append('g').call(d3.axisLeft(y));

			svg
				.append('path')
				.datum(data)
				.attr('fill', 'none')
				.attr('stroke', colors[index])
				.attr('stroke-width', 1.5)
				.attr('d', d3.line().x((d) => x(d.x)).y((d) => y(d.y[index])));

			let labelX = 0 - axleHeight / 2;
			let labelY = 0 - margin.left * 0.8;
			svg
				.append('text')
				.attr('transform', 'rotate(-90)')
				.attr('y', labelY)
				.attr('x', labelX)
				.attr('dy', '1em')
				.style('text-anchor', 'middle')
				.text(labels[index]);
		}
	}
);

function getWidth() {
	return Math.max(
		document.body.scrollWidth,
		document.documentElement.scrollWidth,
		document.body.offsetWidth,
		document.documentElement.offsetWidth,
		document.documentElement.clientWidth
	);
}

function getHeight() {
	return Math.max(
		document.body.scrollHeight,
		document.documentElement.scrollHeight,
		document.body.offsetHeight,
		document.documentElement.offsetHeight,
		document.documentElement.clientHeight
	);
}

"use strict";
const fs = require("fs");
const path = require("path");
const UglifyJS = require("uglify-js");
const compressor = UglifyJS.Compressor();

const FILE_ENCODING = "utf-8";

let Uglify = function(fuller, options) {
	fuller.bind(this);

	this.Stream = fuller.streams.Capacitor;
	this.compress = !options.dev;
	this.src = options.src;
	this.dst = options.dst;
};

Uglify.prototype.build = function(stream, master) {
	let self = this,
		next = new this.Stream(this.compress, function(result, cb) {
			self.uglify(result, cb);
		});

	if(typeof stream === "string") {
		let src = path.join(this.src, stream);
		this.addDependence(src, master);
		return fs.createReadStream(src, {encoding: FILE_ENCODING}).pipe(next);
	} else {
		return stream.pipe(next);
	}
};

Uglify.prototype.uglify = function(jsString, cb) {
	try {
		let ast = UglifyJS.parse(jsString);
		ast.figure_out_scope();
		ast = ast.transform(compressor);
		ast.figure_out_scope();
		ast.compute_char_frequency();
		ast.mangle_names();

		cb(null, ast.print_to_string());
	} catch (err) {
		this.error({
			message: err.message,
			line: err.line,
			column: err.col
			//file:
		});
		cb();
	}
};

module.exports = Uglify;

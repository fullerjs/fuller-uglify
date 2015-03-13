"use strict";
let path = require("path");
let through2 = require("through2");
let uglifyjs = require("uglify-js");
let compressor = uglifyjs.Compressor();

let Uglify = function(fuller, options) {
	fuller.bind(this);

	this.compress = !options.dev;
	this.dst = options.dst;
};

Uglify.prototype.compile = function(jsString, master, cb) {
	try {
		let ast = uglifyjs.parse(jsString);
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
			column: err.col,
			file: path.join(this.dst, master)
		});
		cb();
	}
};

Uglify.prototype.build = function(stream, master) {
	if(!this.compress) { return stream;}

	let self = this,
		buffer = [];

	return stream.pipe( through2(
		function(chunk, enc, cb) {
			buffer.push(chunk);
			cb();
		},
		function(cb) {
			let that = this;
			self.compile(buffer.join(""), master, function(err, result) {
				!err && that.push(result);
				cb();
			});
		}
	));
};


module.exports = Uglify;

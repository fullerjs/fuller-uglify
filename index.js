"use strict";
let path = require("path");
let through2 = require("through2");
let jsp = require("uglify-js").parser;
let pro = require("uglify-js").uglify;

let Uglify = function(fuller, options) {
	fuller.bind(this);

	this.compress = !options.dev;
	this.dst = options.dst;
};

Uglify.prototype.compile = function(jsString, master, cb) {
	try {
		let ast = jsp.parse(jsString); // parse code and get the initial AST
		ast = pro.ast_mangle(ast); // get a new AST with mangled names
		ast = pro.ast_squeeze(ast); // get an AST with compression optimizations

		cb(null, pro.gen_code(ast)); // compressed code here
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

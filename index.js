"use strict";
var fs = require('fs');
var path = require('path');
var UglifyJS = require('uglify-js');
var compressor = UglifyJS.Compressor();

var FILE_ENCODING = 'utf-8';

var Uglify = function(fuller, options) {
	this.Stream = fuller.streams.Capacitor;
	this.compress = !options.dev;
	this.src = options.src;
	this.dst = options.dst;
};

Uglify.prototype.build = function(stream, master) {
	var self = this,
		next = new this.Stream(this.compress, function(result, cb) {
			self.uglify(result, cb);
		});

	if(typeof stream === "string") {
		var src = path.join(this.src, stream);
		this.addDependence(src, master);
		return fs.createReadStream(src, {encoding: FILE_ENCODING}).pipe(next);
	} else {
		return stream.pipe(next);
	}
};

Uglify.prototype.uglify = function(jsString, cb) {
	var ast;

	try {
		ast = UglifyJS.parse(jsString);
	} catch (err) {
		cb(err);
		process.exit();
	}

	ast.figure_out_scope();
	ast = ast.transform(compressor);
	ast.figure_out_scope();
	ast.compute_char_frequency();
	ast.mangle_names();

	cb(null, ast.print_to_string());
};

module.exports = Uglify;

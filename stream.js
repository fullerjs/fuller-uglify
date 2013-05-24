"use strict";
var inherits = require('util').inherits;
var Transform = require('stream').Transform;

var UglifyJS = require('uglify-js');
var compressor = UglifyJS.Compressor();

var Stream = function(options) {
	var self = this;
	Transform.call(this, options);

	this.compress = options.compress;
	this.inputBuffer = [];
};
inherits(Stream, Transform);

Stream.prototype.uglify = function(jsString) {
	if(jsString === undefined) {
		jsString = this.inputBuffer.join('');
	}

	var ast;

	try {
		ast = UglifyJS.parse(jsString);
	} catch (err) {
		console.log(err.message.red);
		process.exit();
	}

	ast.figure_out_scope();
	ast = ast.transform(compressor);
	ast.figure_out_scope();
	ast.compute_char_frequency();
	ast.mangle_names();

	return ast.print_to_string();
};

Stream.prototype._transform = function(chunk, encoding, cb) {
	if(this.compress) {
		this.inputBuffer.push(chunk);
		cb();
	} else {
		cb(null, chunk);
	}
};

Stream.prototype._flush = function(cb) {
	if(this.compress) {
		this.push(this.uglify());
	}
	cb();
};

module.exports = Stream;

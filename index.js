"use strict";
var fs = require('fs');
var path = require('path');

var Stream = require('./stream');

var Uglify = function(fuller, plan) {
	this.options = plan ? plan.stream || {} : {};
	this.options.compress = !fuller.options.dev;
};

Uglify.prototype.getStream = function() {
	return new Stream(this.options);
};

module.exports = Uglify;

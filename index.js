"use strict";
let uglifyjs = require("uglify-js");
let compressor = uglifyjs.Compressor();

module.exports = function(f, mat, options, next) {
	if(options.dev) {
		next(null, mat);
	} else {
		mat.getContent(function(content) {
			try {
				let ast = uglifyjs.parse(content.toString());
				ast.figure_out_scope();
				ast = ast.transform(compressor);
				ast.figure_out_scope();
				ast.compute_char_frequency();
				ast.mangle_names();
				next(null, mat.setContent(ast.print_to_string()));
			} catch (err) {
				next({
					message: err.message,
					line: err.line,
					column: err.col,
					file: mat.dst().path
				});
			}
		});
	}
};

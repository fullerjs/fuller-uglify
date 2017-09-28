'use strict';
const uglify = require('uglify-js');

module.exports = function(f, mat, options, next) {
  if (options.dev) {
    next(null, mat);
  } else {
    mat.getContent( content => {
      const opts = options.uglify || {};
      const res = uglify.minify(content.toString(), opts);

      if (res.error) {
        const err = res.error;
        return next({
          message: err.message,
          line: err.line,
          column: err.col,
          file: mat.dst().path
        });
      }

      if (opts.warnings && res.warnings) {
        res.warnings.forEach(w => console.log(w));
      }

      next(null, mat.setContent(res.code));
    });
  }
};

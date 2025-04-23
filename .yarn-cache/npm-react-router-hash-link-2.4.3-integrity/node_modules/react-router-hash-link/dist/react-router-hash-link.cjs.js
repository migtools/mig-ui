'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./react-router-hash-link.cjs.production.js');
} else {
  module.exports = require('./react-router-hash-link.cjs.development.js');
}

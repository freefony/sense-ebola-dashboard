# sense-ebola-dashboard

[![Build Status][travis-image]][travis-url] [![devDependency Status][daviddm-image]][daviddm-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Code Climate][codeclimate-image]][codeclimate-url]

[travis-url]: https://travis-ci.org/eHealthAfrica/sense-ebola-dashboard
[travis-image]: https://travis-ci.org/eHealthAfrica/sense-ebola-dashboard.png?branch=master
[daviddm-url]: https://david-dm.org/eHealthAfrica/sense-ebola-dashboard#info=devDependencies
[daviddm-image]: https://david-dm.org/eHealthAfrica/sense-ebola-dashboard/dev-status.png?theme=shields.io
[coveralls-url]: https://coveralls.io/r/eHealthAfrica/sense-ebola-dashboard
[coveralls-image]: https://coveralls.io/repos/eHealthAfrica/sense-ebola-dashboard/badge.png
[codeclimate-url]: https://codeclimate.com/github/eHealthAfrica/sense-ebola-dashboard
[codeclimate-image]: https://codeclimate.com/github/eHealthAfrica/sense-ebola-dashboard.png

> Dashboard for Ebola sensed data

## Usage

0. Install [Node.js][] and [Git][]
1. `npm install -g karma grunt-cli bower`
2. `git clone https://github.com/eHealthAfrica/sense-ebola-dashboard.git`
3. `cd sense-ebola-dashboard && npm install; bower install`
4. `grunt serve`

If your browser hasn't already launched, browse to <http://localhost:9000>.

[Node.js]: http://nodejs.org
[Git]: http://git-scm.com

## Testing

Use `grunt test` for the complete test suite. `npm test` is reserved for our
continuous integration server (TravisCI).

### Unit

Use `grunt test:unit`. During development, `npm run-script test-watch` is
useful to automatically re-run the tests when a file changes.

### e2e

`grunt test:e2e`

## Author

© 2014 [eHealth Systems Africa](http://ehealthafrica.org)

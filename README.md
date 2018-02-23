# Manner

[![Build Status](https://travis-ci.org/tether/manner.svg?branch=master)](https://travis-ci.org/tether/manner)
[![NPM](https://img.shields.io/npm/v/manner.svg)](https://www.npmjs.com/package/manner)
[![Downloads](https://img.shields.io/npm/dm/manner.svg)](http://npm-stat.com/charts.html?package=manner)
[![guidelines](https://tether.github.io/contribution-guide/badge-guidelines.svg)](https://github.com/tether/contribution-guide)

Quickly create HTTP services from an object. Manner is framework agnostic and can be plugged to any HTTP server.

  * **know the response type**: Return buffers, streams, promises, objects or any type of primitives. Manner knows your data type and send its content as fast as possible down the HTTP response.
  * **chunk the response content**: Response are encoded using the chunk transfer protocol. Manner is memory efficient and can manage a large amount of concurrent request.
  * **decode the request data**: Manner intelligently decode the data sent through the request and supports any kind of encoding (application/x-www-form-urlencoded, multipart/form-data, json, etc).
  * **manage your service status**: Manner knows what's going on with your response and send the appropriate status code whenever a method has not been implemented, a media type is not supported, etc.
  * **expose methods**: Access your service methods independently from any HTTP request. Perfect to decouple your API from its implementation.
  * **schema**: Apply schema to annotate and validate your service(s) (see [test suite](https://github.com/tether/manner/blob/master/test/manner.js))


<!-- See [features](#features) for more goodness. -->

<!-- Manner is memory efficient and intelligently destroy. -->

## Usage

Create a web service from an object:

```javascript
const http = require('http')
const service= require('manner')

const db = []

const api = service({
  'get': {
    '/': () => 'hello you',
    '/earth': '/world',
    '/:name': (query) => `hello ${query.name}!`
  },
  'post': (query, data) => {
    return db.push(data)
  }
})

// HTTP service
http.createServer((req, res) => {
  api(req, res).pipe(res)
})

// Programmatic service
api.get('/')
// => hello you

api.get('/bob')
// => hello bob!

api.get('/earth')
// => hello world!
```

and programmaticaly add or call routes

```js

const api = service({
  'get': () => 'hello world'
})

api.get('/:name', query => {
  return `hello ${query.name}!`
})

api.get('/bob')
// => hello bob!
```

## Installation

```shell
npm install manner --save
```

[![NPM](https://nodei.co/npm/manner.png)](https://nodei.co/npm/manner/)

<!-- ## features

  * mixin request query payload  -->

## Question

For support, bug reports and or feature requests please make sure to read our
<a href="https://github.com/tether/contribution-guide/blob/master/community.md" target="_blank">community guidelines</a> and use the issue list of this repo and make sure it's not present yet in our reporting checklist.

## Contribution

The open source community is very important to us. If you want to participate to this repository, please make sure to read our <a href="https://github.com/tether/contribution-guide" target="_blank">guidelines</a> before making any pull request. If you have any related project, please let everyone know in our wiki.

## License

The MIT License (MIT)

Copyright (c) 2017 Tether Inc

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

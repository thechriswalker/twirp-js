var client = require('../src/client');
var helpers = require('./helpers');

// Define some constants needed for testing
var mime = 'application/json';
var version = '1.0';
var requestMessage = {};
requestMessage.toObject = function () {
  return {};
};

describe('client.js', function () {
  describe('extendHeaders()', function () {
    test('should return empty object on undefined', function () {
      var headers = client.extendHeaders();
      expect(Object.keys(headers).length).toBe(0);
    });
    test('should not extend if extras is empty', function () {
      var headers = client.extendHeaders({}, { 'foo': 'bar' });
      expect(Object.keys(headers).length).toBe(1);
      expect(headers['foo']).toBe('bar');
    });
    test('should not extend if extras is undefined', function () {
      var headers = client.extendHeaders(undefined, { 'foo': 'bar' });
      expect(Object.keys(headers).length).toBe(1);
      expect(headers['foo']).toBe('bar');
    });
    test('should merge in extras', function () {
      var headers = client.extendHeaders({'extra': 'baz'}, { 'foo': 'bar' });
      expect(Object.keys(headers).length).toBe(2);
      expect(headers['foo']).toBe('bar');
      expect(headers['extra']).toBe('baz');
    });
    test('should extend with extras only', function () {
      var headers = client.extendHeaders({'extra': 'baz'});
      expect(Object.keys(headers).length).toBe(1);
      expect(headers['extra']).toBe('baz');
    });
  });
  describe('makeHeaders()', function () {
    test('should add mime and version headers', function () {
      var headers = client.makeHeaders({}, mime, version);
      expect(headers['Content-Type']).toBe(mime);
      expect(headers['Accept']).toBe(mime);
      expect(headers['Twirp-Version']).toBe(version);
      expect(Object.keys(headers).length).toBe(3);
    });
    test('should not extend if there are no extras', function () {
      var headers = client.makeHeaders({}, mime, version, { 'foo': 'bar' });
      expect(Object.keys(headers).length).toBe(4);
      expect(headers['foo']).toBe('bar');
    });
    test('should merge in extras', function () {
      var headers = client.makeHeaders({ 'extra': 'baz' }, mime, version, { 'foo': 'bar' });
      expect(Object.keys(headers).length).toBe(5);
      expect(headers['foo']).toBe('bar');
      expect(headers['extra']).toBe('baz');
    });
    test('should extend with extras only', function () {
      var headers = client.makeHeaders({ 'extra': 'baz' }, mime, version);
      expect(Object.keys(headers).length).toBe(4);
      expect(headers['extra']).toBe('baz');
    });
  });
  describe('clientFactory()', function () {
    test('should add custom headers', function () {
      var factory = client.clientFactory(function (url, opts) {
        expect(opts.headers['extra']).toBe('baz');
        return new Promise(function(resolve, reject) {
          resolve({status: 200});
        });
      }, helpers.jsonSerialize, helpers.jsonDeserialize);
      var rpc = factory('http://localhost', 'api', '1.0', true);
      rpc('SomeMethod',  requestMessage, null, {'extra': 'baz'});
    });
    test('should not break rpc call on undefined custom headers', function () {
      var factory = client.clientFactory(function (url, opts) {
        expect(Object.keys(opts.headers).length).toBe(3);
        expect(opts.headers['Content-Type']).toBe(mime);
        expect(opts.headers['Accept']).toBe(mime);
        expect(opts.headers['Twirp-Version']).toBe(version);
        return new Promise(function(resolve, reject) {
          resolve({status: 200});
        });
      }, helpers.jsonSerialize, helpers.jsonDeserialize);
      var rpc = factory('http://localhost', 'api', version, true);
      rpc('SomeMethod',  requestMessage, null);
    });
  });
});
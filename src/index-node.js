/**
 * TWIRP RPC Client for Node JS
 */
var clientFactory = require("./client");

// this dependency is a peer-dependency, it must be installed
// but is not necessary for the browser version, so not a hard dependency
// if installed it must be >= 2.0.0 which has the .buffer function.
var fetch = require("node-fetch");

if ("buffer" in fetch.Response.prototype === false) {
    throw new TypeError("node-fetch must be version >= 2.0.0");
}

const serialize = msg => Buffer.from(msg.serializeBinary());
const deserialize = responseType => res => res.buffer()
    .then(b => responseType.deserializeBinary(new Uint8Array(b)).toObject());

module.exports = clientFactory(fetch, serialize, deserialize);

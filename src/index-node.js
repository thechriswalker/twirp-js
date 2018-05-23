/**
 * TWIRP RPC Client for Node JS
 */
var client = require("./client");
var fetch = require("node-fetch");

const serialize = msg => Buffer.from(msg.serializeBinary());
const deserialize = responseType => res => res.buffer()
    .then(b => responseType.deserializeBinary(new Uint8Array(b)).toObject());

module.exports = client.clientFactory(fetch, serialize, deserialize);
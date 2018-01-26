/**
 * TWIRP RPC Client for the Browser
 */
const clientFactory = require("./client");

if ("fetch" in window === false || typeof fetch !== "function") {
    console.warn("TWIRP RPC Client requires `window.fetch` and this browser doesn't support it" +
        "\nPlease install a polyfill such as `whatwg-fetch` (https://github.com/github/fetch)");
}

const serialize = msg => msg.serializeBinary();
const deserialize = responseType => res => res.arrayBuffer()
    .then(buf => responseType.deserializeBinary(new Uint8Array(buf)).toObject());

module.exports = clientFactory(window.fetch, serialize, deserialize);

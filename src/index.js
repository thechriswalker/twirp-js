/**
 * TWIRP RPC Client for the Browser
 */
const client = require("./client");

if ("fetch" in window === false || typeof fetch !== "function") {
    console.warn("TWIRP RPC Client requires `window.fetch` and this browser doesn't support it" +
        "\nPlease install a polyfill such as `whatwg-fetch` (https://github.com/github/fetch)");
}

const serialize = function (msg) { return msg.serializeBinary(); };
const deserialize = function (responseType) {
    return function (res) {
        return res.arrayBuffer().then(function (buf) {
            return responseType.deserializeBinary(new Uint8Array(buf));
        });
    };
};
module.exports = client.clientFactory(window.fetch, serialize, deserialize);

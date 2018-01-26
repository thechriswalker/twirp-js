/**
 * TWIRP RPC Client for javascript
 */
const { resToError } = require("./util");

const clientFactory = (fetchFn, serializer, deserialize) => (baseurl, serviceName, twirpVersion, useJSON, extraHeaders) => {
    const endpoint = baseurl.replace(/\/$/, "") + "/twirp/" + serviceName + "/";
    const mimeType = useJSON ? "application/json" : "application/protobuf";
    const serialize = useJSON
        ? msg => JSON.stringify(msg.toObject())
        : msg => serializer;
    const headers = Object.assign({}, extraHeaders || {}, {
        "Content-Type": mimeType,
        "Accept": mimeType,
        "Twirp-Version": twirpVersion
    });
    const rpc = (method, requestMsg, responseType) => {
        const deserialize = useJSON
            ? res => res.json()
            : deserialize(responseType);
        const opts = {
            method: "POST",
            body: serialize(requestMsg),
            redirect: "manual",
            headers
        };
        return fetchFn(endpoint + method, opts).then(res => {
            // 200 is the only valid response
            if (res.status !== 200) {
                return resToError(res);
            }
            return deserialize(res);
        });
    };
    rpc.buildMessage = buildMessage;
    return rpc;
};

module.exports = clientFactory;

const twirpError = ({ code, msg, meta = {} } = {}) => Object.assign(
    new Error(msg),
    { meta, code }
);

// Twirp Error implementation
function resToError(res) {
    const intermediateError = meta => twirpError({
        code: "internal",
        msg: "Error from intermediary with HTTP status code " +
            res.status + " " + res.statusText,
        meta: meta
    });
    return res.json()
        .then(obj => {
            if (!obj.code || !obj.msg) {
                throw intermediateError(obj);
            }
            throw twirpError(obj);
        },
        _ => { // error decoding JSON error
            throw intermediateError({});
        });
}

// builds a message from an object, set fields if they exist
// in the protobuf message.
function buildMessage(protobufClass, data) {
    const msg = new protobufClass();
    Object.keys(data).forEach(key => {
        const setter = "set" + key[0].toUpperCase() + key.slice(1);
        if (setter in msg) {
            msg[setter](data[key]);
        }
    });
    return msg;
}

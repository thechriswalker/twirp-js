/**
 * TWIRP RPC Client for javascript
 *
 * Written in ugly es5 for compatibility...
 */
function makeHeaders(extras, mime, version, headers) {
    var obj = extendHeaders(extras, headers);
    obj["Content-Type"] = mime;
    obj["Accept"] = mime;
    obj["Twirp-Version"] = version;
    return obj;
};

function extendHeaders(extras, headers) {
    var extendFrom = headers !== undefined ? headers : {};
    extras = extras !== undefined ? extras : {};
    var obj = Object.keys(extras).reduce(function (o, k) {
        o[k] = extras[k];
        return o;
    }, extendFrom);
    return obj;
}

var jsonSerialize = function (msg) {
    return JSON.stringify(msg.toObject());
};
var jsonDeserialize = function (res) {
    return res.json();
};

var clientFactory = function (fetchFn, serializer, deserializer) {
    return function (baseurl, serviceName, twirpVersion, useJSON, extraHeaders) {
        var endpoint = baseurl.replace(/\/$/, "") + serviceName + "/";
        var mimeType = useJSON ? "application/json" : "application/protobuf";
        var serialize = useJSON ? jsonSerialize : serializer;
        var headers = makeHeaders(extraHeaders, mimeType, twirpVersion);
        var rpc = function (method, requestMsg, responseType, customHeaders) {
            var headersWithCustom = extendHeaders(customHeaders, headers);
            var deserialize = useJSON ?
                jsonDeserialize :
                deserializer(responseType);
            var opts = {
                method: "POST",
                body: serialize(requestMsg),
                redirect: "manual",
                headers: headersWithCustom
            };
            return fetchFn(endpoint + method, opts).then(function (res) {
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
};

module.exports = {
    clientFactory: clientFactory,
    makeHeaders: makeHeaders, // export for testing purposes
    extendHeaders: extendHeaders // export for testing purposes
};

function twirpError(obj) {
    var err = new Error(obj.msg);
    err.meta = obj.meta === undefined ? {} : obj.meta;
    err.code = obj.code;
    err.status = obj.status;
    return err;
}

// Twirp Error implementation
function resToError(res) {
    return res.json()
        .then(function (obj) {
                if (!obj.code || !obj.msg) {
                    throw intermediateError(obj);
                }
                throw twirpError(obj);
            },
            function () { // error decoding JSON error
                throw intermediateError({});
            });

    function intermediateError(meta) {
        return twirpError({
            code: "internal",
            msg: "Error from intermediary with HTTP status code " +
                res.status + " " + res.statusText,
            meta: meta,
            status: res.status
        });
    }
}

// builds a message from an object, set fields if they exist
// in the protobuf message.
function buildMessage(protobufClass, data) {
    var msg = new protobufClass();
    Object.keys(data).forEach(function (key) {
        var setter = "set" + key[0].toUpperCase() + key.slice(1);
        if (setter in msg) {
            msg[setter](data[key]);
        }
    });
    return msg;
}
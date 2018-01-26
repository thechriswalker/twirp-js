# twirp rpc client for javascript.

This is a companion package to the twirp rpc system. It can generate
javascript bindings, but this package is required for handling the differences
between the nodejs binding and the browser binding.

The API exposed is identical each time:

```javascript
const createTwirpClient = require("twirp-client");

const rpc = createTwirpClient(baseurl, serviceName, twirpVersion, useJSON, extraHeaders);

// the function returned has the signature:
const resultPromise = rpc(methodName, inputProtobugMessageObject, outputProtobufMessageClass);
```


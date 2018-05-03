function jsonSerialize(msg) {
  return JSON.stringify(msg.toObject());
}

function jsonDeserialize(res) {
  return res.json();
}

module.exports = {
  jsonDeserialize: jsonDeserialize,
  jsonSerialize: jsonSerialize
};
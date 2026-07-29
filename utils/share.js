function encodePayload(payload) {
  return encodeURIComponent(JSON.stringify(payload));
}

function decodePayload(scene) {
  if (!scene) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(scene));
  } catch (error) {
    console.warn('decodePayload failed', error);
    return null;
  }
}

module.exports = {
  encodePayload,
  decodePayload,
};

// Explicit information-only markers never imply a booking partnership.
function isInfoOnly(...sources) {
  return sources.some(source => source && (
    source.mode === 'info' || source.resourceMode === 'info' || source.bookingMode === 'info' ||
    source.bookingEnabled === false || source.canBook === false ||
    (source.contact && source.contact.mode === 'info')
  ));
}
module.exports = { isInfoOnly };

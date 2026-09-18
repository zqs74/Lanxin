// Explicit information-only markers never imply a booking partnership.
function isInfoOnly(...sources) {
  return sources.some(source => source && (
    source.mode === 'info' || source.resourceMode === 'info' || source.bookingMode === 'info' ||
    source.bookingEnabled === false || source.canBook === false ||
    (source.contact && source.contact.mode === 'info') ||
    // Public listings stay information-only even when a plan recommends them.
    (Array.isArray(source.tags) && source.tags.includes('不可直接预约'))
  ));
}
module.exports = { isInfoOnly };

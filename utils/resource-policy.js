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
// Plan cards show what the resource is, not its paper trail: the bracketed labels repeat the tags, and
// the sources, verification date and matching note stay in the resource library where the full text lives.
function briefDescription(text) {
  let value = String(text || '').replace(/^【[^】]*】/, '');
  for (const marker of ['【方案匹配说明】', '网页核验日期', '来源：']) {
    const index = value.indexOf(marker);
    if (index > 0) value = value.slice(0, index);
  }
  return value.trim();
}
module.exports = { isInfoOnly, briefDescription };

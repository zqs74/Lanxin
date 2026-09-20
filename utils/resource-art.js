// 资源封面：有真实照片就用照片，没有就用本分类的插画占位图（明显是分类图，不冒充实拍）。
const ART = {
  venues: '/assets/resources/placeholders/venues.jpg',
  referees: '/assets/resources/placeholders/referees.jpg',
  materials: '/assets/resources/placeholders/materials.jpg',
  rentals: '/assets/resources/placeholders/rentals.jpg',
  suppliers: '/assets/resources/placeholders/suppliers.jpg',
  media: '/assets/resources/placeholders/media.jpg',
  coaches: '/assets/resources/placeholders/coaches.jpg',
  events: '/assets/resources/placeholders/events.jpg',
  teams: '/assets/resources/placeholders/teams.jpg',
};
// 方案页的场馆分组叫 venue，资源库叫 venues。
function coverSrc(resource, category) {
  const own = resource && (resource.cover || resource.avatar || resource.image);
  return own || ART[category] || ART[category + 's'] || ART.venues;
}
module.exports = { coverSrc, ART };

// 资源封面：每条资源都配有经审核的真实照片（照片实际拍的是什么、来自哪里，见后端 data/listing-images/sources.json
// 与 data/venue-images/sources.json）。ART 只是兜底：正常情况下不会用到，因为没有照片的条目已经停用。
const PHOTO = {
  'public-dg-dg01': '/assets/resources/venues/public-dg-dg01.jpg',
  'public-dg-dg02': '/assets/resources/venues/public-dg-dg02.jpg',
  'public-dg-dg03': '/assets/resources/venues/public-dg-dg03.jpg',
  'public-dg-dg04': '/assets/resources/venues/public-dg-dg04.jpg',
  'public-dg-dg08': '/assets/resources/venues/public-dg-dg08.jpg',
  'public-dg-mat01': '/assets/resources/listings/public-dg-mat01.jpg',
  'public-dg-mat02': '/assets/resources/listings/public-dg-mat02.jpg',
  'public-dg-ren01': '/assets/resources/listings/public-dg-ren01.jpg',
  'public-dg-ren02': '/assets/resources/listings/public-dg-ren02.jpg',
  'public-dg-sup01': '/assets/resources/listings/public-dg-sup01.jpg',
  'public-dg-sup02': '/assets/resources/listings/public-dg-sup02.jpg',
  'public-dg-med06': '/assets/resources/listings/public-dg-med06.jpg',
  'public-dg-coa01': '/assets/resources/listings/public-dg-coa01.jpg',
  'public-dg-evt01': '/assets/resources/listings/public-dg-evt01.jpg',
  'public-dg-evt04': '/assets/resources/listings/public-dg-evt04.jpg',
  'public-dg-evt05': '/assets/resources/listings/public-dg-evt05.jpg',
  'public-dg-team01': '/assets/resources/listings/public-dg-team01.jpg',
  'public-dg-team02': '/assets/resources/listings/public-dg-team02.jpg',
};
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
  const id = resource && resource.id;
  return own || PHOTO[id] || ART[category] || ART[category + 's'] || ART.venues;
}
module.exports = { coverSrc, ART, PHOTO };

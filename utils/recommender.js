const { saveRecommendation } = require('./storage');
function createRecommendation(demand, requestId) { return saveRecommendation(demand, requestId); }
module.exports = { createRecommendation };

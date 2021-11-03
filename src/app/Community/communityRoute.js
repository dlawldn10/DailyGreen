
module.exports = function(app) {
    const community = require('./communityController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    //커뮤니티 구독 추가
    app.post('/app/communities', jwtMiddleware, community.postCommunityFollow);
}
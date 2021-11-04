const jwtMiddleware = require("../../../config/jwtMiddleware");
const community = require("./communityController");

module.exports = function(app) {
    const community = require('./communityController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    //커뮤니티 구독 추가
    app.post('/app/communities', jwtMiddleware, community.postCommunityFollow);

    //커뮤니티 구독 취소
    app.patch('/app/communities', jwtMiddleware, community.patchCommunityFollow);



    //홈화면 - 커뮤니티 눌렀을 때
    app.get('/app/communities/:communityIdx', jwtMiddleware, community.getCommunityByCommunityIdx);


    //참여중인 커뮤니티 목록 조회
    app.get('/app/communities', jwtMiddleware, community.getMyCommunities);


}
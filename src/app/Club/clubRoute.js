const jwtMiddleware = require("../../../config/jwtMiddleware");
const club = require("./clubController");


module.exports = function(app) {
    const club = require('./clubController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    const multer = require("multer");
    const upload = multer({ storage: multer.memoryStorage() });

    //모임 생성
    app.post('/app/clubs', jwtMiddleware, upload.array('photos'), club.postClub);

    //모임탭 조회
    app.get('/app/communities/:communityIdx/clubs', jwtMiddleware, club.getClubList);

    //모임 상세 조회
    app.get('/app/clubs/:clubIdx', jwtMiddleware, club.getClub);

    //모임 수정
    app.patch('/app/clubs', jwtMiddleware, upload.none(), club.patchClub);

    //모임 참가/취소
    app.post('/app/clubs/follow', jwtMiddleware, upload.none(), club.postClubFollowing);

    //모임 삭제
    app.patch('/app/clubs/:clubIdx', jwtMiddleware, upload.none(), club.deleteMyClub);

    //모임 검색
    app.get('/app/communities/:communityIdx/clubs/searches', jwtMiddleware, club.getSearchedClubList);

}
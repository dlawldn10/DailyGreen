const jwtMiddleware = require("../../../config/jwtMiddleware");
const workshop = require("./workshopController");



module.exports = function(app) {
    const workshop = require('./workshopController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    const multer = require("multer");
    const upload = multer({storage: multer.memoryStorage()});

    //워크샵 생성
    app.post('/app/workshops', jwtMiddleware, upload.array('photos'), workshop.postWorkshop);

    //워크샵탭 조회
    app.get('/app/communities/:communityIdx/workshops', jwtMiddleware, workshop.getWorkshopList);

    //워크샵 상세 조회
    app.get('/app/workshops/:workshopIdx', jwtMiddleware, workshop.getWorkshop);

    //워크샵 수정
    app.patch('/app/workshops', jwtMiddleware, upload.none(), workshop.patchWorkshop);

    //워크샵 참가/취소
    app.post('/app/workshops/follow', jwtMiddleware, upload.none(), workshop.postWorkshopFollowing);

    //워크샵 삭제
    app.patch('/app/workshops/:workshopIdx', jwtMiddleware, upload.none(), workshop.deleteMyWorkshop);

    //워크샵 검색
    app.get('/app/communities/:communityIdx/workshops/searches', jwtMiddleware, workshop.getSearchedWorkshopList);

}
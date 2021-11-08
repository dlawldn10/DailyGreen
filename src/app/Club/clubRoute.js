const jwtMiddleware = require("../../../config/jwtMiddleware");
const club = require("./clubController");
const multer = require("multer");


module.exports = function(app) {
    const club = require('./clubController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    const multer = require("multer");
    const upload = multer({ storage: multer.memoryStorage() });

    //모임 생성
    app.post('/app/clubs', jwtMiddleware, upload.array('photos'), club.postClub);

    //모임탭 조회
    app.get('/app/clubs', jwtMiddleware, club.getClubList);

}
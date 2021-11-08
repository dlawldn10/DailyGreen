

module.exports = function(app) {
    const workshop = require('./workshopController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    const multer = require("multer");
    const upload = multer({ storage: multer.memoryStorage() });

    //워크샵 생성
    app.post('/app/workshops', jwtMiddleware, upload.array('photos'), workshop.postWorkshop);

}
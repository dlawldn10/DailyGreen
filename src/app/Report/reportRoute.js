const multer = require("multer");
const jwtMiddleware = require("../../../config/jwtMiddleware");
const report = require("./reportController");
module.exports = function(app) {
    const report = require('./reportController');
    const multer = require("multer");
    const upload = multer({storage: multer.memoryStorage()});
    const jwtMiddleware = require('../../../config/jwtMiddleware');


    //신고하기
    app.post('/app/reports', jwtMiddleware, upload.none(), report.postReport);

    //차단하기
    app.post('/app/reports/users', jwtMiddleware, upload.none(), report.postBlockUser);
}
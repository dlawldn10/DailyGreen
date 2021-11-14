const comment = require("./commentController");
const jwtMiddleware = require("../../../config/jwtMiddleware");
const multer = require("multer");

module.exports = function(app) {
    const comment = require("./commentController");
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    const multer = require("multer");
    const upload = multer({ storage: multer.memoryStorage() });

    //댓글 달기
    app.post('/app/comments', jwtMiddleware, upload.none(), comment.postComment);

    //댓글 목록 조회
    app.get('/app/posts/:postIdx/comments', jwtMiddleware,  comment.getComment);



}
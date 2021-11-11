const jwtMiddleware = require("../../../config/jwtMiddleware");
const postController = require("./postControlller");
const multer = require("multer");


module.exports = function(app) {
    const postController = require("./postControlller");
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    const multer = require("multer");
    const upload = multer({ storage: multer.memoryStorage() });


    // 게시글 올리기
    app.post('/app/posts', jwtMiddleware, upload.array('photos'), postController.postMyPost);

    // // 게시글 수정
    // app.patch('/app/posts', jwtMiddleware, postController.patchMyPost);






}
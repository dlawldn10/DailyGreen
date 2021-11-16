const jwtMiddleware = require("../../../config/jwtMiddleware");
const postController = require("./postControlller");
const multer = require("multer");
const post = require("./postControlller");


module.exports = function(app) {
    const post = require("./postControlller");
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    const multer = require("multer");
    const upload = multer({ storage: multer.memoryStorage() });


    // 게시글 올리기
    app.post('/app/posts', jwtMiddleware, upload.array('photos'), post.postMyPost);

    // 게시글탭 조회
    app.get('/app/communities/:communityIdx/posts', jwtMiddleware, post.getPostList);

    // 게시글 수정
    app.patch('/app/posts', jwtMiddleware, upload.none(), post.patchMyPost);

    //좋아요 게시
    app.post('/app/posts/likes', jwtMiddleware, upload.none(), post.postLike);

    // 게시글 삭제
    app.patch('/app/posts/:postIdx', jwtMiddleware, upload.none(), post.deleteMyPost);




}
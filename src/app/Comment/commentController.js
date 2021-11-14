const jwtMiddleware = require("../../../config/jwtMiddleware");
const commentProvider = require("../../app/Comment/commentProvider");
const commentService = require("../../app/Comment/commentService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const regexEmail = require("regex-email");
const jquery = require("jquery");
const {emit} = require("nodemon");

//댓글 달기
exports.postComment = async function (req, res) {

    /**
     * body: accountIdx, postIdx, content
     */

    const reqBody = {
        userIdx : req.verifiedToken.userIdx,
        postIdx: req.body.postIdx,
        content: req.body.content
    }


    if (!reqBody.userIdx) return res.send(errResponse(baseResponse.TOKEN_EMPTY));
    if (!reqBody.postIdx) return res.send(errResponse(baseResponse.POSTIDX_EMPTY));
    if (!reqBody.content) return res.send(errResponse(baseResponse.COMMENT_CONTENT_EMPTY));

    const postCommentResponse = await commentService.createNewComment(reqBody);

    return res.send(postCommentResponse);
};


//댓글 조회
exports.getComment = async function (req, res) {


    const userIdxFromJWT = req.verifiedToken.userIdx;
    const postIdx = req.params.postIdx;


    if (!postIdx) return res.send(errResponse(baseResponse.POSTIDX_EMPTY));
    if (!userIdxFromJWT) return res.send(errResponse(baseResponse.TOKEN_EMPTY));

    const getCommentResponse = await commentProvider.getCommentList(userIdxFromJWT, postIdx);

    return res.send(response(baseResponse.SUCCESS, getCommentResponse));
};



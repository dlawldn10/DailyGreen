const jwtMiddleware = require("../../../config/jwtMiddleware");
const postProvider = require("../../app/Post/postProvider");
const postService = require("../../app/Post/postService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const {emit} = require("nodemon");

//게시물 올리기
exports.postMyPost = async function (req, res) {

    const userIdxFromJWT = req.verifiedToken.userIdx
    const reqBody =
        {
            communityIdx: req.body.communityIdx,
            caption  : req.body.caption,
            postTagList : req.body.postTagList,
            postPhotoList : req.files };

    // 빈 값 체크
    if (!reqBody.userIdx)
        return res.send(response(baseResponse.TOKEN_EMPTY));
    else if(!reqBody.postPhotoList)
        return res.send(response(baseResponse.POST_PHOTOLIST_EMPTY));
    else if(!reqBody.communityIdx)
        return res.send(response(baseResponse.COMMUNITYIDX_EMPTY));


    const postResponse = await postService.createPost(reqBody, userIdxFromJWT);

    return res.send(postResponse);
};


//게시물 수정하기
exports.patchMyPost = async function (req, res) {

    //action -> 'ACTIVE' / 'DELETED'
    const accountIdxFromJWT = req.verifiedToken.accountIdx
    const reqBody =
        {
            postIdx: req.body.postIdx,
            accountIdx : req.body.accountIdx,
            caption  : req.body.caption,
            postTagList : req.body.postTagList,
            action : req.body.action
        };

    // 빈 값 체크
    if (!reqBody.accountIdx)
        return res.send(response(baseResponse.ACCOUNTIDX_EMPTY));
    else if(!reqBody.action)
        return res.send(response(baseResponse.ACTION_EMPTY));


    if(reqBody.action == 'ACTIVE'){
        const postResponse = await postService.updatePost(reqBody);
        return res.send(postResponse);
    }else if(reqBody.action == 'DELETED'){
        const postResponse = await postService.deletePost(reqBody);
        return res.send(postResponse);
    }else{
        return res.send(response(baseResponse.ACTION_WRONG));
    }





};



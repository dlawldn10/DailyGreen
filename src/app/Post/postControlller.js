const postProvider = require("../../app/Post/postProvider");
const postService = require("../../app/Post/postService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");


//게시물 올리기
exports.postMyPost = async function (req, res) {

    const userIdxFromJWT = req.verifiedToken.userIdx;
    const reqBody =
        {
            communityIdx: req.body.communityIdx,
            caption  : req.body.caption,
            // postTagList : req.body.postTagList,
            postPhotoList : req.files
        };

    // 빈 값 체크
    if (!userIdxFromJWT)
        return res.send(response(baseResponse.TOKEN_EMPTY));
    else if(!reqBody.postPhotoList)
        return res.send(response(baseResponse.POST_PHOTOLIST_EMPTY));
    else if(!reqBody.communityIdx)
        return res.send(response(baseResponse.COMMUNITYIDX_EMPTY));

    //게시물 사진이 6개 이상이면
    if(reqBody.postPhotoList.length > 5) {
        return res.send(response(baseResponse.FEED_TOO_MUCH_PHOTOS));
    }

    const postResponse = await postService.createPost(reqBody, userIdxFromJWT);

    return res.send(postResponse);
};


//게시물 수정하기
exports.patchMyPost = async function (req, res) {

    const userIdxFromJWT = req.verifiedToken.userIdx;
    const reqBody =
        {
            postIdx: req.body.postIdx,
            communityIdx: req.body.communityIdx,
            caption  : req.body.caption
        };

    // 빈 값 체크
    if (!userIdxFromJWT)
        return res.send(response(baseResponse.TOKEN_EMPTY));
    else if(!reqBody.communityIdx)
        return res.send(response(baseResponse.COMMUNITYIDX_EMPTY));
    else if(!reqBody.postIdx)
        return res.send(response(baseResponse.POSTIDX_EMPTY));


    const postResponse = await postService.updatePost(reqBody);
    return res.send(postResponse);

};


//게시물탭 조회
exports.getPostList = async function (req, res){

    let page = req.query.page;
    const communityIdx = req.params.communityIdx;
    const userIdxFromJWT = req.verifiedToken.userIdx;

    const limit = 15;

    if (!userIdxFromJWT)
        return res.send(errResponse(baseResponse.TOKEN_EMPTY));
    else if (!communityIdx)
        return res.send(errResponse(baseResponse.COMMUNITYIDX_EMPTY));

    if(limit-page < 0){

        page = 0;

    }else if(page == 0 || !page){

        return res.send(errResponse(baseResponse.PAGECOUNT_WRONG));
    }else{

        page = (page-1)*limit

    }

    const retrievePostsResult = await postProvider.retrievePostList(userIdxFromJWT, page, limit, communityIdx);
    return res.send(response(baseResponse.SUCCESS, retrievePostsResult));

}


//좋아요 게시
exports.postLike = async function (req, res) {


    const userIdxFromJWT = req.verifiedToken.userIdx;
    const postIdx = req.body.postIdx;


    if (!userIdxFromJWT) return res.send(errResponse(baseResponse.USERIDX_EMPTY));
    else if(!postIdx) return res.send(errResponse(baseResponse.POSTIDX_EMPTY));

    const createPostLikeResponse = await postService.createPostLike(
        userIdxFromJWT, postIdx
    );

    return res.send(createPostLikeResponse);
};


//게시물 삭제하기
exports.deleteMyPost = async function (req, res) {

    const userIdxFromJWT = req.verifiedToken.userIdx;
    const postIdx = req.params.postIdx;

    // 빈 값 체크
    if (!userIdxFromJWT)
        return res.send(response(baseResponse.TOKEN_EMPTY));
    else if(!postIdx)
        return res.send(response(baseResponse.POSTIDX_EMPTY));


    const postResponse = await postService.deletePost(userIdxFromJWT, postIdx);
    return res.send(postResponse);

};


//특정 인물이 쓴 게시물 커뮤니티별로 조회
exports.getCreatedPostList = async function (req, res){

    let page = req.query.page;
    const userIdx = req.params.userIdx;
    const userIdxFromJWT = req.verifiedToken.userIdx;

    const limit = 15;

    if (!userIdxFromJWT)
        return res.send(errResponse(baseResponse.TOKEN_EMPTY));
    else if (!userIdx)
        return res.send(errResponse(baseResponse.USERIDX_EMPTY));

    if(limit-page < 0){

        page = 0;

    }else if(page == 0 || !page){

        return res.send(errResponse(baseResponse.PAGECOUNT_WRONG));
    }else{

        page = (page-1)*limit

    }

    const retrievePostsResult = await postProvider.retrieveCreatedPostList(userIdxFromJWT, userIdx, page, limit);
    return res.send(response(baseResponse.SUCCESS, retrievePostsResult));

}

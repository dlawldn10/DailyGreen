const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const postDao = require("./postDao");

//게시물 탭 조회
exports.retrievePostList = async function (userIdx, page, limit, communityIdx) {

    const connection = await pool.getConnection(async (conn) => conn);
    connection.beginTransaction();

    const postListResult = await postDao.selectPostList(connection, userIdx, page, limit, communityIdx);

    let postList = [];
    for(let i = 0; i<postListResult.length; i++){
        const postIdx = postListResult[i].postIdx;
        // console.log(postIdx);
        const ifFollowingUserResult = await postDao.selectIfFollowing(connection, userIdx, postListResult[i].userIdx);
        const ifPostLikeResult = await postDao.selectIfPostLiked(connection, userIdx, postIdx);
        const postTotalLikeResult = await postDao.selectAllPostLikes(connection, postIdx);
        const postTotalCommentResult = await postDao.selectAllCommentsCount(connection, postIdx);

        const photoUrlListResult = await postDao.selectPostPhotoUrls(connection, postIdx);


        const postPhotoUrlListObj = {
            postIdx : postIdx,
            urlList: photoUrlListResult
        }


        const Result ={
            postInfoObj: Object.assign({},
                postListResult[i],
                ifFollowingUserResult[0],
                ifPostLikeResult[0],
                postTotalLikeResult[0],
                postTotalCommentResult[0]
            ),
            postPhotoUrlListObj: postPhotoUrlListObj

        }

        postList.push(Result);
    }

    connection.commit();
    connection.release();

    return postList;

};


//특정 인물이 쓴 게시물 커뮤니티별 조회
exports.retrieveCreatedPostList = async function (userIdxFromJWT, userIdx, page, limit) {

    const connection = await pool.getConnection(async (conn) => conn);
    connection.beginTransaction();

    const postListResult = await postDao.selectCreatedPostList(connection, page, limit, userIdx);

    let postList = [];
    for(let i = 0; i<postListResult.length; i++){
        const postIdx = postListResult[i].postIdx;
        // console.log(postIdx);
        const ifFollowingUserResult = await postDao.selectIfFollowing(connection, userIdxFromJWT, userIdx);
        const ifPostLikeResult = await postDao.selectIfPostLiked(connection, userIdxFromJWT, postIdx);
        const postTotalLikeResult = await postDao.selectAllPostLikes(connection, postIdx);
        const postTotalCommentResult = await postDao.selectAllCommentsCount(connection, postIdx);

        const photoUrlListResult = await postDao.selectCreatedPostPhotoUrls(connection, postIdx);


        const postPhotoUrlListObj = {
            postIdx : postIdx,
            urlList: photoUrlListResult
        }


        const Result ={
            postInfoObj: Object.assign({},
                postListResult[i],
                ifFollowingUserResult[0],
                ifPostLikeResult[0],
                postTotalLikeResult[0],
                postTotalCommentResult[0]
            ),
            postPhotoUrlListObj: postPhotoUrlListObj

        }

        postList.push(Result);
    }

    connection.commit();
    connection.release();

    return postList;

};


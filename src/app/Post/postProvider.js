const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const postDao = require("./postDao");

//게시물 탭 조회
exports.retrievePostList = async function (userIdx, page, limit, communityIdx) {

    const connection = await pool.getConnection(async (conn) => conn);
    connection.beginTransaction();

    const postListResult = await postDao.selectPostList(connection, page, limit, communityIdx);

    let postList = [];
    for(let i = 0; i<postListResult.length; i++){
        const postIdx = postListResult[i].postIdx;
        // console.log(postIdx);
        const ifFollowingUserResult = await postDao.selectIfFollowing(connection, userIdx, postIdx);
        const ifPostLikeResult = await postDao.selectIfPostLiked(connection, userIdx, postIdx);
        const postTotalLikeResult = await postDao.selectAllPostLikes(connection, postIdx);
        const postTotalCommentResult = await postDao.selectAllCommentsCount(connection, postIdx);

        const photoUrlListResult = await postDao.selectPostPhotoUrls(connection, userIdx, postIdx);


        const postPhotoUrlListObj = {
            postIdx : postIdx,
            urlList: photoUrlListResult
        }


        const Result ={
            postList: Object.assign({},
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


const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const postDao = require("./postDao");

exports.retrievePostList = async function (accountIdx, page, limit) {

    const connection = await pool.getConnection(async (conn) => conn);
    const postListResult = await postDao.selectPostFromFollowingUsers(connection, accountIdx, limit, page);

    connection.release();

    console.log(postListResult);
    return postListResult;

};


exports.retrieveUserPost = async function (accountIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        connection.beginTransaction();
        const postUpperListResult = await postDao.selectPostFromOne(connection, accountIdx);
        connection.commit();


        return postUpperListResult;
    }catch (e) {
        connection.rollback();
    }finally {
        connection.release();
    }



};


exports.retrieveMyFeed = async function (myAccountIdx, accountIdx) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction();
        const feedDataResult = await postDao.selectMyFeedData(connection, accountIdx);
        await connection.commit();

        const isFollowingResult = await postDao.selectIsFollowing(connection, myAccountIdx, accountIdx);
        const storyResult = await postDao.selectIfStoryExist(connection, accountIdx);
        const coverPhotoUrlResult = await postDao.selectMyFeedCoverPhotos(connection, accountIdx);


        await connection.commit();

        const feedResult = {
            profileData: Object.assign(feedDataResult[0], isFollowingResult[0]),
            storyCnt: storyResult[0],
            feedPreviewList: coverPhotoUrlResult
        }

        return feedResult;

    }catch (e) {
        await connection.rollback();
        console.log(e);
    }finally {
        connection.release();
    }

};

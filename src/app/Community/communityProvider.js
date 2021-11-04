const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const communityDao = require("./communityDao");
const {errResponse, response} = require("../../../config/response");
const baseResponse = require("../../../config/baseResponseStatus");


//홈화면 - 특정 커뮤니티 눌렀을 때
exports.retrieveCommunityByCommunityIdx = async function (communityIdx) {
    const connection = await pool.getConnection(async (conn) => conn);

    connection.beginTransaction();
    //각 커뮤니티에 참여중인 사람들의 수와
    const selectCountResult = await communityDao.selectCommunityFollowingUsersCount(
        connection,
        communityIdx
    );
    //각 커뮤니티에 참여중인 사람들 3명의 프사를 알아낸다.
    const selectProfilePhotoResult = await communityDao.selectCommunityFollowingUsersProfilePhoto(
        connection,
        communityIdx
    );
    const profilePhotoUrlList = {
        urlList: selectProfilePhotoResult
    }
    connection.release();

    return Object.assign({}, selectCountResult[0], profilePhotoUrlList);
};

//참여중인 커뮤니티 목록 조회
exports.retrieveMyCommunities = async function (userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);

    connection.beginTransaction();
    //참여중인 커뮤니티들을 알아내고
    const selectMyCommunitiesResult = await communityDao.selectMyCommunities(connection, userIdx);

    let CommunityList = [];
    for(let i = 0; i<selectMyCommunitiesResult.length; i++){

        //각 커뮤니티에 참여중인 사람들의 수와
        const selectCountResult = await communityDao.selectCommunityFollowingUsersCount(
            connection,
            selectMyCommunitiesResult[i].communityIdx
        );
        //각 커뮤니티에 참여중인 사람들 3명의 프사를 알아낸다.
        const selectProfilePhotoResult = await communityDao.selectCommunityFollowingUsersProfilePhoto(
            connection,
            selectMyCommunitiesResult[i].communityIdx
        );

        // 합친다.
        const profilePhotoUrlList = {
            urlList: selectProfilePhotoResult
        }
        CommunityList.push(Object.assign({}, selectMyCommunitiesResult[i], selectCountResult[0], profilePhotoUrlList));

    }

    connection.release();

    return CommunityList;
};

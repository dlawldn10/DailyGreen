const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const communityProvider = require("./communityProvider");
const communityDao = require("./communityDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");

//구독 추가
exports.createCommunityFollow = async function (userIdxFromJWT, communityIdx) {
    const connection = await pool.getConnection(async (conn) => conn);

    await connection.beginTransaction();
    //이미 팔로우 중인지 확인
    const selectFollowRow = await communityDao.selectIfCommunityFollowing(connection, userIdxFromJWT, communityIdx);


    if(selectFollowRow === undefined){
        //팔로우 중이 아니라면 -> 추가
        const insertFollowRow = await communityDao.insertCommunityFollow(connection, userIdxFromJWT, communityIdx);
        const selectCommunityRow = await communityDao.selectCommunityByCommunityIdx(connection, communityIdx);
        await connection.commit();
        connection.release();

        return response(baseResponse.COMMUNITY_FOLLOW_SUCCESS);
    }
    else if (selectFollowRow.status === "DELETED") {
        //취소했었던 기록이 있다면 -> ACTIVE로 수정
        const updateFollowRow = await communityDao.updateCommunityFollow(connection, userIdxFromJWT, communityIdx, 'ACTIVE');
        const selectCommunityRow = await communityDao.selectCommunityByCommunityIdx(connection, communityIdx);
        await connection.commit();
        connection.release();

        return response(baseResponse.COMMUNITY_FOLLOW_SUCCESS);
    }
    else if (selectFollowRow.status === "ACTIVE") {
        //이미 팔로우 중이라면

        connection.release();
        return response(baseResponse.COMMUNITY_FOLLOW_ERROR);
    }




}


//구독 취소
exports.updateCommunityFollow = async function (userIdxFromJWT, communityIdx) {
    const connection = await pool.getConnection(async (conn) => conn);

    await connection.beginTransaction();
    //이미 팔로우 중인지 확인
    const selectFollowRow = await communityDao.selectIfCommunityFollowing(connection, userIdxFromJWT, communityIdx);


    if(selectFollowRow === undefined){
        //팔로우 했던 적도 없을때
        connection.release();
        return response(baseResponse.COMMUNITY_UNFOLLOW_ERROR);
    }
    else if (selectFollowRow.status === "ACTIVE") {
        //추가했었던 기록이 있다면 -> DELETED로 수정
        const updateFollowRow = await communityDao.updateCommunityFollow(connection, userIdxFromJWT, communityIdx, 'DELETED');
        const selectCommunityRow = await communityDao.selectCommunityByCommunityIdx(connection, communityIdx);
        await connection.commit();
        connection.release();

        return response(baseResponse.COMMUNITY_UNFOLLOW_SUCCESS);
    }
    else if (selectFollowRow.status === "DELETED") {
        //이미 구독 안하고있는 상태라면

        connection.release();
        return response(baseResponse.COMMUNITY_UNFOLLOW_ERROR);
    }




}
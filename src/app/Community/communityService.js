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

        return response(baseResponse.SUCCESS, {
            alert : `${selectCommunityRow.communityName} 커뮤니티에 참여하였습니다.`
        });
    }
    else if (selectFollowRow.status === "DELETED") {
        //취소했었던 기록이 있다면 -> ACTIVE로 수정
        const updateFollowRow = await communityDao.updateCommunityFollow(connection, userIdxFromJWT, communityIdx, 'ACTIVE');
        const selectCommunityRow = await communityDao.selectCommunityByCommunityIdx(connection, communityIdx);
        await connection.commit();
        connection.release();

        return response(baseResponse.SUCCESS, {
            alert : `${selectCommunityRow.communityName} 커뮤니티에 참여하였습니다.`
        });
    }
    else if (selectFollowRow.status === "ACTIVE") {
        //이미 팔로우 중이라면

        connection.release();
        return response(baseResponse.SUCCESS, {
            alert : `이미 해당 커뮤니티에 참여중입니다.`
        });
    }




}
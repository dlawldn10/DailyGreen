const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const clubProvider = require("./clubProvider");
const clubDao = require("./clubDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");

//모임 추가
exports.createClub = async function (userIdxFromJWT, clubInfo, clubPhotoUrlList) {
    const connection = await pool.getConnection(async (conn) => conn);

    await connection.beginTransaction();

    //모임 정보 넣기
    const insertClubInfoParams = [
        clubInfo.communityIdx, userIdxFromJWT, clubInfo.clubName, clubInfo.bio,
        clubInfo.maxPeopleNum, clubInfo.when, clubInfo.locationIdx,
        clubInfo.locationDetail, clubInfo.kakaoChatLink, clubInfo.isRegular]
    const insertClubInfoRow = await clubDao.insertClubInfo(connection, insertClubInfoParams);


    //모임 회비 정보 넣기
    const insertClubFeeInfoRow = await clubDao.insertClubFeeInfo(connection, insertClubInfoRow.insertId, clubInfo.fee, clubInfo.feeType);



    if(clubInfo.isRegular == 0){
        //비정기 모임일때 -> 태그 없음, 사진 한장

        const insertClubPhotoUrlRow = await clubDao.insertClubPhotoUrl(connection, insertClubInfoRow.insertId, userIdxFromJWT, clubPhotoUrlList[0]);

        await connection.commit();
        connection.release();

        return response(baseResponse.CREATE_CLUB_SUCCESS);
    }

    //사진들 넣기
    for(let i=0;i<clubPhotoUrlList.length;i++){
        const insertClubPhotoUrlRow = await clubDao.insertClubPhotoUrl(connection, insertClubInfoRow.insertId, userIdxFromJWT, clubPhotoUrlList[i]);
    }

    //태그들 게시
    for(let i =0; i < clubInfo.tagList.length; i++){


        const insertTagResult = await clubDao.insertHashTag(connection, clubInfo.tagList[i]);
        const selectTagResult = await clubDao.selectTagByTagName(connection, clubInfo.tagList[i]);
        const insertStoryTagResult = await clubDao.insertClubHashTags(connection, selectTagResult[0].tagIdx, insertClubInfoRow.insertId);

    }


    await connection.commit();
    connection.release();

    return response(baseResponse.CREATE_CLUB_SUCCESS);



}



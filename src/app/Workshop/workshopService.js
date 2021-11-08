const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const workshopProvider = require("./workshopProvider");
const workshopDao = require("./workshopDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");

//워크샵 추가
exports.createWorkshop = async function (userIdxFromJWT, workshopInfo, workshopPhotoUrlList) {
    const connection = await pool.getConnection(async (conn) => conn);

    await connection.beginTransaction();

    //워크샵 정보 넣기
    const insertWorkshopInfoParams = [
        workshopInfo.communityIdx, userIdxFromJWT, workshopInfo.workshopName, workshopInfo.bio,
        workshopInfo.maxPeopleNum, workshopInfo.when, workshopInfo.locationIdx,
        workshopInfo.locationDetail, workshopInfo.kakaoChatLink]
    const insertWorkshopInfoRow = await workshopDao.insertWorkshopInfo(connection, insertWorkshopInfoParams);


    //워크샵 회비 정보 넣기
    const insertClubFeeInfoRow = await workshopDao.insertWorkshopFeeInfo(connection, insertWorkshopInfoRow.insertId, workshopInfo.fee, workshopInfo.feeType);



    if(workshopInfo.isRegular == 0){
        //비정기 워크샵일때 -> 태그 없음, 사진 한장

        const insertWorkshopPhotoUrlRow = await workshopDao.insertWorkshopPhotoUrl(connection, insertWorkshopInfoRow.insertId, userIdxFromJWT, workshopPhotoUrlList[0]);

        await connection.commit();
        connection.release();

        return response(baseResponse.CREATE_WORKSHOP_SUCCESS);
    }

    //워크샵들 넣기
    for(let i=0;i<workshopPhotoUrlList.length;i++){
        const insertClubPhotoUrlRow = await workshopDao.insertWorkshopPhotoUrl(connection, insertWorkshopInfoRow.insertId, userIdxFromJWT, workshopPhotoUrlList[i]);
    }

    //워크샵들 게시
    for(let i =0; i < workshopInfo.tagList.length; i++){


        const insertTagResult = await workshopDao.insertHashTag(connection, workshopInfo.tagList[i]);
        const selectTagResult = await workshopDao.selectTagByTagName(connection, workshopInfo.tagList[i]);
        const insertStoryTagResult = await workshopDao.insertWorkshopHashTags(connection, selectTagResult[0].tagIdx, insertWorkshopInfoRow.insertId);

    }


    await connection.commit();
    connection.release();

    return response(baseResponse.CREATE_WORKSHOP_SUCCESS);



}



const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const workshopDao = require("./workshopDao");
const {errResponse, response} = require("../../../config/response");
const baseResponse = require("../../../config/baseResponseStatus");


exports.retrieveWorkshopList = async function (userIdx, page, limit, communityIdx) {

    const connection = await pool.getConnection(async (conn) => conn);
    connection.beginTransaction();

    const workshopListResult = await workshopDao.selectWorkshopList(connection, communityIdx, userIdx, limit, page);

    let workshopList = [];
    for(let i = 0; i<workshopListResult.length; i++){
        const workshopIdx = workshopListResult[i].workshopIdx;

        const nowFollowingCountResult = await workshopDao.selectWorkshopFollowers(connection, workshopIdx);
        let profilePhotoUrlListObj = {}
        if(nowFollowingCountResult[0].nowFollowing == 0){
            profilePhotoUrlListObj = {}
        }else{
            const photoUrlListResult = await workshopDao.selectThreeFollowingUsersProfilePhotos(connection, workshopIdx);
            profilePhotoUrlListObj = {
                workshopIdx : workshopListResult[i].workshopIdx,
                urlList: photoUrlListResult
            }
        }


        const tagListResult = await workshopDao.selectWorkshopTags(connection, workshopIdx);
        let tagListObj = {};
        if(tagListResult[0] != null) {
            tagListObj = {
                workshopIdx: workshopIdx,
                tagList: tagListResult
            }
        }

        const Result ={
            workshopInfoObj: Object.assign(workshopListResult[i], nowFollowingCountResult[0]),
            profilePhotoUrlListObj: profilePhotoUrlListObj,
            workshopTagListObj: tagListObj
        }

        workshopList.push(Result);
    }

    connection.release();

    return workshopList;

};

exports.retrieveWorkshop = async function (userIdx, workshopIdx){
    const connection = await pool.getConnection(async (conn) => conn);
    connection.beginTransaction();

    //?????? ??????
    const workshopResult = await workshopDao.selectWorkshopByWorkshopIdx(connection, workshopIdx);


    //?????? ??????
    const workshopPhotoUrlListResult = await workshopDao.selectWorkshopPhotoUrls(connection, workshopIdx);
    const workshopPhotoUrlListObj = {
        workshopIdx : workshopIdx,
        urlList: workshopPhotoUrlListResult
    }


    //?????? ????????? ???
    const nowFollowingCountResult = await workshopDao.selectWorkshopFollowers(connection, workshopIdx);


    //??????????????? ????????? ?????????
    let participantListObj = {};
    if(nowFollowingCountResult[0].nowFollowing == 0){
        //????????? ?????? ???
        participantListObj = {};
    }else{
        //????????? ?????? ???
        const profileListResult = await workshopDao.selectFollowingUsersProfile(connection, workshopIdx);
        participantListObj = {
            workshopIdx : workshopIdx,
            participants: profileListResult
        }
    }


    //????????? ?????? ??????
    const tagListResult = await workshopDao.selectWorkshopTags(connection, workshopIdx);
    let tagListObj = {};
    if(tagListResult[0] != null) {
        tagListObj = {
            workshopIdx: workshopIdx,
            tagList: tagListResult
        }
    }

    const Result ={
        workshopInfoObj: Object.assign(workshopResult[0], nowFollowingCountResult[0]),
        workshopPhotoUrlListObj: workshopPhotoUrlListObj,
        participantListObj: participantListObj,
        workshopTagListObj: tagListObj
    }

    connection.release();

    return Result;
}

exports.retrieveSearchedWorkshopList = async function (userIdx, page, limit, communityIdx, keyword) {

    const connection = await pool.getConnection(async (conn) => conn);
    connection.beginTransaction();

    const workshopListResult = await workshopDao.selectSearchedWorkshopList(connection, communityIdx, limit, page, keyword);

    let workshopList = [];
    for(let i = 0; i<workshopListResult.length; i++){
        const workshopIdx = workshopListResult[i].workshopIdx;

        const nowFollowingCountResult = await workshopDao.selectWorkshopFollowers(connection, workshopIdx);
        let profilePhotoUrlListObj = {}
        if(nowFollowingCountResult[0].nowFollowing == 0){
            profilePhotoUrlListObj = {}
        }else{
            const photoUrlListResult = await workshopDao.selectThreeFollowingUsersProfilePhotos(connection, workshopIdx);
            profilePhotoUrlListObj = {
                workshopIdx : workshopListResult[i].workshopIdx,
                urlList: photoUrlListResult
            }
        }


        const tagListResult = await workshopDao.selectWorkshopTags(connection, workshopIdx);
        let tagListObj = {};
        if(tagListResult[0] != null) {
            tagListObj = {
                workshopIdx: workshopIdx,
                tagList: tagListResult
            }
        }

        const Result ={
            workshopInfoObj: Object.assign(workshopListResult[i], nowFollowingCountResult[0]),
            profilePhotoUrlListObj: profilePhotoUrlListObj,
            workshopTagListObj: tagListObj
        }

        workshopList.push(Result);
    }

    connection.release();

    return workshopList;

};
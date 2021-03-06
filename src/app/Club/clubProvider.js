const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const clubDao = require("./clubDao");
const {errResponse, response} = require("../../../config/response");
const baseResponse = require("../../../config/baseResponseStatus");


exports.retrieveClubList = async function (userIdx, lastClubIdx, limit, communityIdx) {

    const connection = await pool.getConnection(async (conn) => conn);
    connection.beginTransaction();

    if(lastClubIdx == 0){
        const maxClubIdxResult = await clubDao.selectMaxClubIdx(connection);
        lastClubIdx = maxClubIdxResult[0].maxClubIdx + 1;
    }

    const clubListResult = await clubDao.selectClubList(connection, communityIdx, userIdx, limit, lastClubIdx);

    let clubList = [];
    for(let i = 0; i<clubListResult.length; i++){
        const clubIdx = clubListResult[i].clubIdx;

        const nowFollowingCountResult = await clubDao.selectClubFollowers(connection, clubIdx);
        let profilePhotoUrlListObj = {}
        if(nowFollowingCountResult[0].nowFollowing === 0){
            profilePhotoUrlListObj = {}
        }else{
            const photoUrlListResult = await clubDao.selectThreeFollowingUsersProfilePhotos(connection, clubIdx);
            profilePhotoUrlListObj = {
                clubIdx : clubListResult[i].clubIdx,
                urlList: photoUrlListResult
            }
        }


        const tagListResult = await clubDao.selectClubTags(connection, clubIdx);
        let tagListObj = {};
        if(tagListResult[0] != null) {
            tagListObj = {
                clubIdx: clubIdx,
                tagList: tagListResult
            }
        }

        const Result ={
            clubInfoObj: Object.assign(clubListResult[i], nowFollowingCountResult[0]),
            profilePhotoUrlListObj: profilePhotoUrlListObj,
            clubTagListObj: tagListObj
        }

        clubList.push(Result);
    }

    connection.release();

    return clubList;

};


exports.retrieveClub = async function (userIdx, clubIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    connection.beginTransaction();

    //TODO: ???????????? ?????????????????? ??? ????????? ????????? ????????? ?????? ?????????
    // ??????????????? ?????? ????????? ACTIVE ???????????? validation?????? ??????

    // ?????? ?????? ??? ?????? ??????
    const clubInfoResult = await clubDao.selectClubStatusByClubIdx(connection, clubIdx);

    if (clubInfoResult[0].status === "DELETED") {
        return errResponse(baseResponse.INVALID_CLUBINFO);
    }

    //?????? ??????
    const clubResult = await clubDao.selectClubByClubIdx(connection, clubIdx);


    //?????? ??????
    const clubPhotoUrlListResult = await clubDao.selectClubPhotoUrls(connection, clubIdx);
    const clubPhotoUrlListObj = {
        clubIdx : clubIdx,
        urlList: clubPhotoUrlListResult
    }


    //?????? ????????? ???
    const nowFollowingCountResult = await clubDao.selectClubFollowers(connection, clubIdx);


    //??????????????? ????????? ?????????
    let participantListObj = {};
    if(nowFollowingCountResult != undefined) {
        if (nowFollowingCountResult[0].nowFollowing == 0) {
            //????????? ?????? ???
            participantListObj = {};
        } else {
            //????????? ?????? ???
            const profileListResult = await clubDao.selectFollowingUsersProfile(connection, clubIdx);
            participantListObj = {
                clubIdx: clubIdx,
                participants: profileListResult
            }
        }
    }


    //????????? ?????? ??????
    const tagListResult = await clubDao.selectClubTags(connection, clubIdx);
    let tagListObj = {};
    if(tagListResult[0] != null) {
        tagListObj = {
            clubIdx: clubIdx,
            tagList: tagListResult
        }
    }

    const Result ={
        clubInfoObj: Object.assign(clubResult[0], nowFollowingCountResult[0]),
        clubPhotoUrlListObj: clubPhotoUrlListObj,
        participantListObj: participantListObj,
        clubTagListObj: tagListObj
    }

    connection.release();

    return response(baseResponse.SUCCESS, Result);

}


exports.retrieveSearchedClubList = async function (userIdx, page, limit, communityIdx, keyword) {

    console.log(keyword);
    const connection = await pool.getConnection(async (conn) => conn);
    connection.beginTransaction();

    const clubListResult = await clubDao.selectSearchedClubList(connection, communityIdx, limit, page, keyword);

    let clubList = [];
    for(let i = 0; i<clubListResult.length; i++){
        const clubIdx = clubListResult[i].clubIdx;

        const nowFollowingCountResult = await clubDao.selectClubFollowers(connection, clubIdx);
        let profilePhotoUrlListObj = {}
        if(nowFollowingCountResult[0].nowFollowing == 0){
            profilePhotoUrlListObj = {}
        }else{
            const photoUrlListResult = await clubDao.selectThreeFollowingUsersProfilePhotos(connection, clubIdx);
            profilePhotoUrlListObj = {
                clubIdx : clubListResult[i].clubIdx,
                urlList: photoUrlListResult
            }
        }


        const tagListResult = await clubDao.selectClubTags(connection, clubIdx);
        let tagListObj = {};
        if(tagListResult[0] != null) {
            tagListObj = {
                clubIdx: clubIdx,
                tagList: tagListResult
            }
        }

        const Result ={
            clubInfoObj: Object.assign(clubListResult[i], nowFollowingCountResult[0]),
            profilePhotoUrlListObj: profilePhotoUrlListObj,
            clubTagListObj: tagListObj
        }

        clubList.push(Result);
    }

    connection.release();

    return clubList;

};
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

    //TODO: 상세정보 조회눌렀는데 그 사이에 모임이 삭제될 수도 있으니
    // 조회하고자 하는 모임이 ACTIVE 상태인지 validation처리 필요

    // 모임 존재 및 상태 확인
    const clubInfoResult = await clubDao.selectClubStatusByClubIdx(connection, clubIdx);

    if (clubInfoResult[0].status === "DELETED") {
        return errResponse(baseResponse.INVALID_CLUBINFO);
    }

    //모임 정보
    const clubResult = await clubDao.selectClubByClubIdx(connection, clubIdx);


    //모임 사진
    const clubPhotoUrlListResult = await clubDao.selectClubPhotoUrls(connection, clubIdx);
    const clubPhotoUrlListObj = {
        clubIdx : clubIdx,
        urlList: clubPhotoUrlListResult
    }


    //현재 참가자 수
    const nowFollowingCountResult = await clubDao.selectClubFollowers(connection, clubIdx);


    //참가자들의 프사와 닉네임
    let participantListObj = {};
    if(nowFollowingCountResult != undefined) {
        if (nowFollowingCountResult[0].nowFollowing == 0) {
            //참가자 없을 때
            participantListObj = {};
        } else {
            //참가자 있을 때
            const profileListResult = await clubDao.selectFollowingUsersProfile(connection, clubIdx);
            participantListObj = {
                clubIdx: clubIdx,
                participants: profileListResult
            }
        }
    }


    //모임에 달린 태그
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
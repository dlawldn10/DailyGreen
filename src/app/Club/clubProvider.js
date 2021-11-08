const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const clubDao = require("./clubDao");
const {errResponse, response} = require("../../../config/response");
const baseResponse = require("../../../config/baseResponseStatus");


exports.retrieveClubList = async function (userIdx, page, limit) {

    const connection = await pool.getConnection(async (conn) => conn);
    const clubListResult = await clubDao.selectClubList(connection, limit, page);

    let clubList = [];
    for(let i = 0; i<clubListResult.length; i++){
        const clubIdx = clubListResult[i].clubIdx;

        const nowFollowingCountResult = await clubDao.selectClubFollowers(connection, clubIdx);
        let profilePhotoUrlListObj = {}
        if(nowFollowingCountResult[0].nowFollowing == 0){
            profilePhotoUrlListObj = {}
        }else{
            const photoUrlListResult = await clubDao.selectFollowingUsersProfilePhotos(connection, clubIdx);
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
            clubInfo: Object.assign(clubListResult[i], nowFollowingCountResult[0]),
            profilePhotoUrlListObj: profilePhotoUrlListObj,
            clubTagList: tagListObj
        }

        clubList.push(Result);
    }

    connection.release();

    return clubList;

};


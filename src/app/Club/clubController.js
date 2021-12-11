const clubProvider = require("../../app/Club/clubProvider");
const clubService = require("../../app/Club/clubService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");
const admin = require('firebase-admin');
const multer = require('multer');
const stream = require('stream');
const serviceAccount = require('../../../dailygreen-6e49d-firebase-adminsdk-8g5gf-6d834b83b1.json');
const request = require("request");
let firebaseAdmin = admin;
if (!admin.apps.length) {
    firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'dailygreen-6e49d.appspot.com'
    });
}


//모임 생성
exports.postClub = async function (req, res) {

    const userIdxFromJWT = req.verifiedToken.userIdx;
    const clubInfo = {
        communityIdx : req.body.communityIdx,
        clubName : req.body.name,
        clubPhotoList : req.files,
        tagList : req.body.tagList,
        bio : req.body.bio,
        maxPeopleNum: req.body.maxPeopleNum,
        feeType : req.body.feeType,
        fee : req.body.fee,
        kakaoChatLink :req.body.kakaoChatLink,
        isRegular : req.body.isRegular,
        locationIdx :req.body.locationIdx,
        locationDetail : req.body.locationDetail,
        when : req.body.when
    }

    console.log(clubInfo.tagList);
    if(typeof(clubInfo.tagList) === "string") {
        let tmpList = [];
        tmpList.push(clubInfo.tagList);
        delete clubInfo.tagList;
        clubInfo.tagList = tmpList;
    }


    // 빈 값 체크
    if (!userIdxFromJWT)
        return res.send(response(baseResponse.TOKEN_VERIFICATION_FAILURE));
    else if (!clubInfo.communityIdx)
        return res.send(response(baseResponse.COMMUNITYIDX_EMPTY));
    else if (!clubInfo.clubName)
        return res.send(response(baseResponse.CLUBNAME_EMPTY));
    else if (!clubInfo.tagList)
        clubInfo.tagList = [''];
    else if (!clubInfo.bio)
        return res.send(response(baseResponse.BIO_EMPTY));
    else if (!clubInfo.maxPeopleNum)
        return res.send(response(baseResponse.MAXPEOPLENUM_EMPTY));
    else if (!clubInfo.feeType)
        return res.send(response(baseResponse.FEETYPE_EMPTY));
    else if (!clubInfo.fee)
        return res.send(response(baseResponse.FEE_EMPTY));
    else if (!clubInfo.kakaoChatLink)
        clubInfo.kakaoChatLink = '';
    else if (!clubInfo.isRegular)
        return res.send(response(baseResponse.ISREGULAR_EMPTY));
    else if (!clubInfo.locationIdx)
        return res.send(response(baseResponse.LOCATIONIDX_EMPTY));
    else if (!clubInfo.locationDetail)
        return res.send(response(baseResponse.LOCATIONDETAIL_EMPTY));
    else if (!clubInfo.when)
        return res.send(response(baseResponse.WHEN_EMPTY));

    if (clubInfo.isRegular == 0 && clubInfo.clubPhotoList.length > 1) {
        //비정기 모임인데 사진이 2개 이상일때
        return res.send(response(baseResponse.TOO_MUCH_PHOTOS));
    }
    else if(clubInfo.isRegular == 1 && clubInfo.clubPhotoList.length > 5){
        //정기 모임인데 사진이 6개 이상일때
        return res.send(response(baseResponse.TOO_MUCH_PHOTOS));
    }

    const createClubResponse = await clubService.createClub(userIdxFromJWT, clubInfo);
    return res.send(createClubResponse);




}


//모임탭 조회
exports.getClubList = async function (req, res){

    let page = req.query.page;
    const communityIdx = req.params.communityIdx;
    const userIdxFromJWT = req.verifiedToken.userIdx;

    const limit = 15;

    if (!userIdxFromJWT)
        return res.send(errResponse(baseResponse.TOKEN_EMPTY));
    else if (!communityIdx)
        return res.send(errResponse(baseResponse.COMMUNITYIDX_EMPTY));

    if(limit-page < 0){

        page = 0;

    }else if(page == 0 || !page){

        return res.send(errResponse(baseResponse.PAGECOUNT_WRONG));
    }else{

        page = (page-1)*limit

    }

    const postsFromFollowingUsers = await clubProvider.retrieveClubList(userIdxFromJWT, page, limit, communityIdx);
    return res.send(response(baseResponse.SUCCESS, postsFromFollowingUsers));

}

//모임 상세 조회
exports.getClub = async function (req, res){

    const clubIdx = req.params.clubIdx;
    const userIdxFromJWT = req.verifiedToken.userIdx;

    if (!userIdxFromJWT)
        return res.send(errResponse(baseResponse.TOKEN_EMPTY));
    else if (!clubIdx)
        return res.send(errResponse(baseResponse.CLUBIDX_EMPTY));

    const retrieveClubResult = await clubProvider.retrieveClub(userIdxFromJWT, clubIdx);
    return res.send(response(baseResponse.SUCCESS, retrieveClubResult));

}


//모임 수정
exports.patchClub = async function (req, res){

    const userIdxFromJWT = req.verifiedToken.userIdx;
    const clubInfo = {
        clubIdx: req.body.clubIdx,
        communityIdx : req.body.communityIdx,
        clubName : req.body.name,
        tagList : req.body.tagList,
        bio : req.body.bio,
        maxPeopleNum: req.body.maxPeopleNum,
        feeType : req.body.feeType,
        fee : req.body.fee,
        kakaoChatLink :req.body.kakaoChatLink,
        isRegular : req.body.isRegular,
        locationIdx :req.body.locationIdx,
        locationDetail : req.body.locationDetail,
        when : req.body.when
    }


    // 빈 값 체크
    if (!userIdxFromJWT)
        return res.send(response(baseResponse.TOKEN_VERIFICATION_FAILURE));
    else if (!clubInfo.communityIdx)
        return res.send(response(baseResponse.COMMUNITYIDX_EMPTY));
    else if (!clubInfo.clubName)
        return res.send(response(baseResponse.CLUBNAME_EMPTY));
    else if (!clubInfo.tagList)
        return res.send(response(baseResponse.TAGLIST_EMPTY));
    else if (!clubInfo.bio)
        return res.send(response(baseResponse.BIO_EMPTY));
    else if (!clubInfo.maxPeopleNum)
        return res.send(response(baseResponse.MAXPEOPLENUM_EMPTY));
    else if (!clubInfo.feeType)
        return res.send(response(baseResponse.FEETYPE_EMPTY));
    else if (!clubInfo.fee)
        return res.send(response(baseResponse.FEE_EMPTY));
    else if (!clubInfo.kakaoChatLink)
        return res.send(response(baseResponse.KAKAOCAHTLINK_EMPTY));
    else if (!clubInfo.isRegular)
        return res.send(response(baseResponse.ISREGULAR_EMPTY));
    else if (!clubInfo.locationIdx)
        return res.send(response(baseResponse.LOCATIONIDX_EMPTY));
    else if (!clubInfo.locationDetail)
        return res.send(response(baseResponse.LOCATIONDETAIL_EMPTY));
    else if (!clubInfo.when)
        return res.send(response(baseResponse.WHEN_EMPTY));
    else if (!clubInfo.clubIdx)
        return res.send(response(baseResponse.CLUBIDX_EMPTY));


    const updateClubResponse = await clubService.updateClub(userIdxFromJWT, clubInfo);
    return res.send(updateClubResponse);


}


//모임 참가 취소
exports.postClubFollowing = async function (req, res){

    const clubIdx = req.body.clubIdx;
    const userIdxFromJWT = req.verifiedToken.userIdx;

    if (!userIdxFromJWT)
        return res.send(errResponse(baseResponse.TOKEN_EMPTY));
    else if (!clubIdx)
        return res.send(errResponse(baseResponse.CLUBIDX_EMPTY));

    const retrieveClubResult = await clubService.createClubFollowing(userIdxFromJWT, clubIdx);
    return res.send(retrieveClubResult);

}


//모임 삭제
exports.deleteMyClub = async function (req, res){

    const clubIdx = req.params.clubIdx;
    const userIdxFromJWT = req.verifiedToken.userIdx;

    if (!userIdxFromJWT)
        return res.send(errResponse(baseResponse.TOKEN_EMPTY));
    else if (!clubIdx)
        return res.send(errResponse(baseResponse.CLUBIDX_EMPTY));

    const retrieveClubResult = await clubService.deleteClub(userIdxFromJWT, clubIdx);
    return res.send(retrieveClubResult);

}

//검색 모임 조회
exports.getSearchedClubList = async function (req, res){

    const keyword = req.query.keyword;
    let page = req.query.page;
    const communityIdx = req.params.communityIdx;
    const userIdxFromJWT = req.verifiedToken.userIdx;

    const limit = 15;

    if (!userIdxFromJWT)
        return res.send(errResponse(baseResponse.TOKEN_EMPTY));
    else if (!communityIdx)
        return res.send(errResponse(baseResponse.COMMUNITYIDX_EMPTY));
    else if (!keyword)
        return res.send(errResponse(baseResponse.KEYWORD_EMPTY));

    if(limit-page < 0){

        page = 0;

    }else if(page == 0 || !page){

        return res.send(errResponse(baseResponse.PAGECOUNT_WRONG));
    }else{

        page = (page-1)*limit

    }

    const postsFromFollowingUsers = await clubProvider.retrieveSearchedClubList(userIdxFromJWT, page, limit, communityIdx, keyword);
    return res.send(response(baseResponse.SUCCESS, postsFromFollowingUsers));

}

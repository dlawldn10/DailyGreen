const workshopProvider = require("../../app/Workshop/workshopProvider");
const workshopService = require("../../app/Workshop/workshopService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

//워크샵 생성
exports.postWorkshop = async function (req, res) {

    const userIdxFromJWT = req.verifiedToken.userIdx;
    const workshopInfo = {
        communityIdx : req.body.communityIdx,
        workshopName : req.body.name,
        workshopPhotoList : req.files,
        tagList : req.body.tagList,
        bio : req.body.bio,
        maxPeopleNum: req.body.maxPeopleNum,
        feeType : req.body.feeType,
        fee : req.body.fee,
        kakaoChatLink :req.body.kakaoChatLink,
        locationIdx :req.body.locationIdx,
        locationDetail : req.body.locationDetail,
        when : req.body.when
    }


    // 빈 값 체크
    if (!userIdxFromJWT)
        return res.send(response(baseResponse.TOKEN_VERIFICATION_FAILURE));
    else if (!workshopInfo.communityIdx)
        return res.send(response(baseResponse.COMMUNITYIDX_EMPTY));
    else if (!workshopInfo.workshopName)
        return res.send(response(baseResponse.CLUBNAME_EMPTY));
    // else if (!workshopInfo.workshopPhotoList)
    //     return res.send(response(baseResponse.CLUBPHOTOURLLIST_EMPTY));
    else if (!workshopInfo.tagList)
        workshopInfo.tagList = [''];
    else if (!workshopInfo.bio)
        return res.send(response(baseResponse.BIO_EMPTY));
    else if (!workshopInfo.maxPeopleNum)
        return res.send(response(baseResponse.MAXPEOPLENUM_EMPTY));
    else if (!workshopInfo.feeType)
        return res.send(response(baseResponse.FEETYPE_EMPTY));
    else if (!workshopInfo.fee)
        return res.send(response(baseResponse.FEE_EMPTY));
    else if (!workshopInfo.kakaoChatLink)
        workshopInfo.kakaoChatLink = '';
    else if (!workshopInfo.locationIdx)
        return res.send(response(baseResponse.LOCATIONIDX_EMPTY));
    else if (!workshopInfo.locationDetail)
        return res.send(response(baseResponse.LOCATIONDETAIL_EMPTY));
    else if (!workshopInfo.when)
        return res.send(response(baseResponse.WHEN_EMPTY));


    const createWorkshopResponse = await workshopService.createWorkshop(userIdxFromJWT, workshopInfo);
    return res.send(createWorkshopResponse);



}


//워크샵탭 조회
exports.getWorkshopList = async function (req, res){

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

    const workshopListResult = await workshopProvider.retrieveWorkshopList(userIdxFromJWT, page, limit, communityIdx);
    return res.send(response(baseResponse.SUCCESS, workshopListResult));

}


//워크샵 상세 조회
exports.getWorkshop = async function (req, res){

    const workshopIdx = req.params.workshopIdx;
    const userIdxFromJWT = req.verifiedToken.userIdx;

    if (!userIdxFromJWT)
        return res.send(errResponse(baseResponse.TOKEN_EMPTY));
    else if (!workshopIdx)
        return res.send(errResponse(baseResponse.WORKSHOPIDX_EMPTY));

    const retrieveWorkshopResult = await workshopProvider.retrieveWorkshop(userIdxFromJWT, workshopIdx);
    return res.send(response(baseResponse.SUCCESS, retrieveWorkshopResult));

}


//워크샵 수정
exports.patchWorkshop = async function (req, res){

    const userIdxFromJWT = req.verifiedToken.userIdx;
    const workshopInfo = {
        workshopIdx: req.body.workshopIdx,
        communityIdx : req.body.communityIdx,
        workshopName : req.body.name,
        workshopPhotoList : req.files,
        tagList : req.body.tagList,
        bio : req.body.bio,
        maxPeopleNum: req.body.maxPeopleNum,
        feeType : req.body.feeType,
        fee : req.body.fee,
        kakaoChatLink :req.body.kakaoChatLink,
        locationIdx :req.body.locationIdx,
        locationDetail : req.body.locationDetail,
        when : req.body.when
    }


    // 빈 값 체크
    if (!userIdxFromJWT)
        return res.send(response(baseResponse.TOKEN_VERIFICATION_FAILURE));
    else if (!workshopInfo.communityIdx)
        return res.send(response(baseResponse.COMMUNITYIDX_EMPTY));
    else if (!workshopInfo.workshopName)
        return res.send(response(baseResponse.CLUBNAME_EMPTY));
    else if (!workshopInfo.tagList)
        return res.send(response(baseResponse.TAGLIST_EMPTY));
    else if (!workshopInfo.bio)
        return res.send(response(baseResponse.BIO_EMPTY));
    else if (!workshopInfo.maxPeopleNum)
        return res.send(response(baseResponse.MAXPEOPLENUM_EMPTY));
    else if (!workshopInfo.feeType)
        return res.send(response(baseResponse.FEETYPE_EMPTY));
    else if (!workshopInfo.fee)
        return res.send(response(baseResponse.FEE_EMPTY));
    else if (!workshopInfo.kakaoChatLink)
        return res.send(response(baseResponse.KAKAOCAHTLINK_EMPTY));
    else if (!workshopInfo.locationIdx)
        return res.send(response(baseResponse.LOCATIONIDX_EMPTY));
    else if (!workshopInfo.locationDetail)
        return res.send(response(baseResponse.LOCATIONDETAIL_EMPTY));
    else if (!workshopInfo.when)
        return res.send(response(baseResponse.WHEN_EMPTY));

    const updateWorkshopResponse = await workshopService.updateWorkshop(userIdxFromJWT, workshopInfo);
    return res.send(updateWorkshopResponse);


}

//워크샵 참가 취소
exports.postWorkshopFollowing = async function (req, res){

    const workshopIdx = req.body.workshopIdx;
    const userIdxFromJWT = req.verifiedToken.userIdx;

    if (!userIdxFromJWT)
        return res.send(errResponse(baseResponse.TOKEN_EMPTY));
    else if (!workshopIdx)
        return res.send(errResponse(baseResponse.WORKSHOPIDX_EMPTY));

    const createWorkshopFollowingResult = await workshopService.createWorkshopFollowing(userIdxFromJWT, workshopIdx);
    return res.send(createWorkshopFollowingResult);

}


//워크샵 삭제
exports.deleteMyWorkshop = async function (req, res){

    const workshopIdx = req.params.workshopIdx;
    const userIdxFromJWT = req.verifiedToken.userIdx;

    if (!userIdxFromJWT)
        return res.send(errResponse(baseResponse.TOKEN_EMPTY));
    else if (!workshopIdx)
        return res.send(errResponse(baseResponse.WORKSHOPIDX_EMPTY));

    const deleteWorkshopResult = await workshopService.deleteWorkshop(userIdxFromJWT, workshopIdx);
    return res.send(deleteWorkshopResult);

}


//검색 워크샵 조회
exports.getSearchedWorkshopList = async function (req, res){

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

    const workshopListResult = await workshopProvider.retrieveSearchedWorkshopList(userIdxFromJWT, page, limit, communityIdx, keyword);
    return res.send(response(baseResponse.SUCCESS, workshopListResult));

}



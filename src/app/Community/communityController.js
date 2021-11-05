
const communityProvider = require("../../app/Community/communityProvider");
const communityService = require("../../app/Community/communityService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const regexEmail = require("regex-email");
const {emit} = require("nodemon");


//구독 추가
exports.postCommunityFollow = async function (req, res) {

    const userIdxFromJWT = req.verifiedToken.userIdx;
    const communityIdx = req.body.communityIdx;


    // 빈 값 체크
    if (!userIdxFromJWT)
        return res.send(response(baseResponse.TOKEN_VERIFICATION_FAILURE));
    else if (!communityIdx)
        return res.send(response(baseResponse.COMMUNITYIDX_EMPTY));


    const postCommunityFollowResponse = await communityService.createCommunityFollow(userIdxFromJWT, communityIdx);
    return res.send(postCommunityFollowResponse);


}

//구독 취소
exports.patchCommunityFollow = async function (req, res) {

    const userIdxFromJWT = req.verifiedToken.userIdx;
    const communityIdx = req.body.communityIdx;


    // 빈 값 체크
    if (!userIdxFromJWT)
        return res.send(response(baseResponse.TOKEN_VERIFICATION_FAILURE));
    else if (!communityIdx)
        return res.send(response(baseResponse.COMMUNITYIDX_EMPTY));


    const patchCommunityFollowResponse = await communityService.updateCommunityFollow(userIdxFromJWT, communityIdx);
    return res.send(patchCommunityFollowResponse);


}

//홈화면 - 특정 커뮤니티 눌렀을 때
exports.getCommunityByCommunityIdx = async function (req, res) {

    const userIdxFromJWT = req.verifiedToken.userIdx;
    const communityIdx = req.params.communityIdx;

    // 빈 값 체크
    if (!userIdxFromJWT)
        return res.send(response(baseResponse.TOKEN_VERIFICATION_FAILURE));
    else if (!communityIdx)
        return res.send(response(baseResponse.COMMUNITYIDX_EMPTY));

    const retrieveMyCommunitiesResponse = await communityProvider.retrieveCommunityByCommunityIdx(communityIdx);
    return res.send(response(baseResponse.SUCCESS, retrieveMyCommunitiesResponse));


};


//참여중인 커뮤니티 목록 조회
exports.getMyCommunities = async function (req, res) {

    const userIdxFromJWT = req.verifiedToken.userIdx;

    // 빈 값 체크
    if (!userIdxFromJWT)
        return res.send(response(baseResponse.TOKEN_VERIFICATION_FAILURE));

    const retrieveMyCommunitiesResponse = await communityProvider.retrieveMyCommunities(userIdxFromJWT);
    return res.send(response(baseResponse.SUCCESS, retrieveMyCommunitiesResponse));


};
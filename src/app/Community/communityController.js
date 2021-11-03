const jwtMiddleware = require("../../../config/jwtMiddleware");
const communityProvider = require("../../app/Community/communityProvider");
const communityService = require("../../app/Community/communityService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const regexEmail = require("regex-email");
const jquery = require("jquery");
const {emit} = require("nodemon");


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
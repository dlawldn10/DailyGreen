const reportProvider = require("../../app/Report/reportProvider");
const reportService = require("../../app/Report/reportService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

exports.postReport = async function (req, res){

    const userIdxFromJWT = req.verifiedToken.userIdx;
    const reportInfo = {
        userIdx: userIdxFromJWT,
        sort: req.body.sort,
        idx: req.body.idx,
        content: req.body.content
    }

    if (!userIdxFromJWT)
        return res.send(errResponse(baseResponse.TOKEN_EMPTY));
    else if (!reportInfo.sort)
        return res.send(errResponse(baseResponse.SIGNUP_SORT_EMPTY));
    else if (!reportInfo.idx)
        return res.send(errResponse(baseResponse.IDX_EMPTY));
    else if (!reportInfo.content)
        return res.send(errResponse(baseResponse.REPORT_CONTENT_EMPTY));


    const postReportResult = await reportService.postReport(reportInfo);
    return res.send(postReportResult);


}


exports.postBlockUser = async function (req, res){

    const userIdxFromJWT = req.verifiedToken.userIdx;
    const blockUserInfo = {
        fromUserIdx: userIdxFromJWT,
        toUserIdx : req.body.userIdx,
    }

    if (!userIdxFromJWT)
        return res.send(errResponse(baseResponse.TOKEN_EMPTY));
    else if (!blockUserInfo.toUserIdx)
        return res.send(errResponse(baseResponse.USERIDX_EMPTY));


    const postReportResult = await reportService.postBlock(blockUserInfo);
    return res.send(postReportResult);


}


const chatProvider = require("../../app/Chat/chatPovider");
const chatService = require("../../app/Chat/chatService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

//쪽지 보내기
exports.postChat = async function (req, res){

    const userIdxFromJWT = req.verifiedToken.userIdx;
    const msg = req.body.content;
    const toUserIdx = req.body.userIdx;

    if(!msg)
        return res.send(response(baseResponse.MESSAGE_EMPTY));
    else if(!toUserIdx)
        return res.send(response(baseResponse.USERIDX_EMPTY));
    else if(!userIdxFromJWT)
        return res.send(response(baseResponse.TOKEN_EMPTY));

    const postMessageResult = await chatService.createMessage(userIdxFromJWT, toUserIdx, msg);
    return res.send(postMessageResult);
}


//특정 인물과 대화 기록 조회
exports.getChatHistory = async function (req, res){

    const userIdxFromJWT = req.verifiedToken.userIdx;
    const toUserIdx = req.params.userIdx;

    if(!toUserIdx)
        return res.send(response(baseResponse.USERIDX_EMPTY));
    else if(!userIdxFromJWT)
        return res.send(response(baseResponse.TOKEN_EMPTY));

    const getMessageHistoryResult = await chatProvider.getMessageHistory(userIdxFromJWT, toUserIdx);
    return res.send(response(baseResponse.SUCCESS, getMessageHistoryResult));
}



//채팅방 목록 조회
exports.getChatRooms = async function (req, res){

    const userIdxFromJWT = req.verifiedToken.userIdx;

    if(!userIdxFromJWT)
        return res.send(response(baseResponse.TOKEN_EMPTY));

    const getChatRoomListResult = await chatProvider.getChatRoomList(userIdxFromJWT);
    return res.send(response(baseResponse.SUCCESS, getChatRoomListResult));
}

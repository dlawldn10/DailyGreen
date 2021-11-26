const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const chatDao = require("./chatDao");
const {errResponse, response} = require("../../../config/response");
const baseResponse = require("../../../config/baseResponseStatus");


exports.getMessageHistory = async function (fromUserIdx, toUserIdx, msg){
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();

        const selectMessageHistoryResult = await chatDao.selectMessageHistory(connection, fromUserIdx, toUserIdx);
        const selectToUserProfileResult = await chatDao.selectToUserProfile(connection, toUserIdx);

        const Result = {
            toUserInfo: selectToUserProfileResult[0],
            history: selectMessageHistoryResult
        }
        await connection.commit();
        return Result;

    }catch (err) {
        connection.rollback();
        logger.error(`App - getMessageHistory Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }finally {
        connection.release();
    }
}


exports.getChatRoomList = async function (fromUserIdx){
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();


        const selectChatRoomListResult = await chatDao.selectChatRoomUserList(connection, fromUserIdx);

        let chatRoomList = [];
        for(let i =0; i <selectChatRoomListResult.length; i++){
            const selectToUserProfileResult = await chatDao.selectChatPreview(connection, fromUserIdx, selectChatRoomListResult[i].toUserIdx);
            const Result = {
                toUserInfo: selectChatRoomListResult[i],
                preview: selectToUserProfileResult[0]
            }
            chatRoomList.push(Result);

        }


        await connection.commit();
        return chatRoomList;

    }catch (err) {
        connection.rollback();
        logger.error(`App - getChatRoomList Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }finally {
        connection.release();
    }
}

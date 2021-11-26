const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const chatProvider = require("./chatPovider");
const chatDao = require("./chatDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");


exports.createMessage = async function (fromUserIdx, toUserIdx, msg){
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();

        const insertMsgResult = await chatDao.insertMessage(connection, fromUserIdx, toUserIdx, msg);
        await connection.commit();
        return response(baseResponse.SEND_MESSAGE_SUCCESS);

    }catch (err) {
        connection.rollback();
        logger.error(`App - createMessage Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }finally {
        connection.release();
    }
}




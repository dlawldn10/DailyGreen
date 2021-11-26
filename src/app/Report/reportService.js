const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const reportProvider = require("./reportProvider");
const reportDao = require("./reportDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");



//신고하기
exports.postReport = async function (reportInfo) {
    const connection = await pool.getConnection(async (conn) => conn);

    connection.beginTransaction();
    const insertReportResult = await reportDao.insertReport(connection, reportInfo);

    connection.commit();
    return response(baseResponse.REPORT_SUCCESS);
}


//유저 차단하기
exports.postBlock = async function (blockUserInfo) {
    const connection = await pool.getConnection(async (conn) => conn);

    connection.beginTransaction();
    const insertReportResult = await reportDao.insertBlockUser(connection, blockUserInfo);

    connection.commit();
    return response(baseResponse.BLOCK_SUCCESS);
}


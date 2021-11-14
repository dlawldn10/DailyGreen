const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const commentProvider = require("./commentProvider");
const commentDao = require("./commentDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");

// Service: Create, Update, Delete 비즈니스 로직 처리

//댓글 게시
exports.createNewComment = async function (reqBody) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {

        connection.beginTransaction();
        const insertCommentResult = await commentDao.insertComment(connection, reqBody);
        connection.commit();

        return response(baseResponse.INSERT_COMMENT_SUCCESS);


    } catch (err) {
        connection.rollback();
        logger.error(`App - createNewComment Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }finally {
        connection.release();
    }
};


//댓글 삭제
exports.updateComment = async function (reqBody) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {

        connection.beginTransaction();
        const updateCommentResult = await commentDao.updateComment(connection, reqBody, 'DELETED');
        connection.commit();

        return response(baseResponse.SUCCESS, "댓글이 삭제되었습니다.");



    } catch (err) {
        connection.rollback();
        logger.error(`App - updateComment Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }finally {
        connection.release();
    }
};

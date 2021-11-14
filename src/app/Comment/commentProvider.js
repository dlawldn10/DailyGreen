const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const commentDao = require("./commentDao");


//댓글 조회
exports.getCommentList = async function (userIdx, postIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    connection.beginTransaction();
    //댓글들 데이터 불러오기
    // const postDataResult = await commentDao.selectPostData(connection, postIdx);
    // const tagListResult = await commentDao.selectPostTags(connection, postIdx);
    const commentListResult = await commentDao.selectCommentList(connection, userIdx, postIdx);

    connection.commit();
    connection.release();

    return commentListResult;

};





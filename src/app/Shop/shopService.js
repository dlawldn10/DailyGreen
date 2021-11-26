const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const shopDao = require("./shopDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

//관심상점 추가
exports.createShopLike = async function (userIdx, shopIdx) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {

        connection.beginTransaction();
        const LikeStatus = await shopDao.selectIfLikeExist(connection, userIdx, shopIdx);

        if(LikeStatus[0] === undefined) {
            //좋아요 추가
            const insertPostLikeResult = await shopDao.insertLikeInfo(connection, userIdx, shopIdx);
            connection.commit();
            return response(baseResponse.INSERT_SHOPLIKE_SUCCESS, {
                isShopLiked: 1
            });
        }else if(LikeStatus[0].status === 'ACTIVE' ){
            //좋아요 취소
            const updatePostLikeResult = await shopDao.updateLikeInfo(connection, userIdx, shopIdx, 'INACTIVE');
            connection.commit();
            return response(baseResponse.CANCEL_SHOPLIKE_SUCCESS, {
                isShopLiked: 0
            });
        }else if(LikeStatus[0].status === 'INACTIVE'){
            //다시 좋아요 추가
            const updatePostLikeResult = await shopDao.updateLikeInfo(connection, userIdx, shopIdx, 'ACTIVE');
            connection.commit();
            return response(baseResponse.REINSERT_SHOPLIKE_SUCCESS, {
                isShopLiked: 1
            });
        }


    } catch (err) {
        connection.rollback();
        logger.error(`App - createShopLike Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }finally {
        connection.release();
    }
};

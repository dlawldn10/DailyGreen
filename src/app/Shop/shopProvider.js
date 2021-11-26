const {pool} = require("../../../config/database");
const shopDao = require("./shopDao");
const {errResponse, response} = require("../../../config/response");
const baseResponse = require("../../../config/baseResponseStatus");


exports.retrieveShopList = async function (userIdx, page, limit) {

    const connection = await pool.getConnection(async (conn) => conn);

    const shopListResult = await shopDao.selectShopList(connection, userIdx, limit, page);

    connection.release();

    return shopListResult;

};

exports.retrieveLikedShopList = async function (userIdx, page, limit) {

    const connection = await pool.getConnection(async (conn) => conn);

    let shopListResult = await shopDao.selectLikedShopList(connection, userIdx, limit, page);
    const obj = {
        "isShopLiked" : 1
    }

    connection.release();

    for(let i=0; i<shopListResult.length; i++){
        shopListResult[i] = Object.assign({}, shopListResult[i], obj);
    }

    return shopListResult;

};


exports.retrieveShop = async function (userIdx, shopIdx) {

    const connection = await pool.getConnection(async (conn) => conn);

    const shopResult = await shopDao.selectShop(connection, userIdx, shopIdx);
    const shopUrlListResult = await shopDao.selectShopPhotoUrls(connection, shopIdx);

    if(shopResult[0].phoneNum === '000-0000-0000'){
        shopResult[0].phoneNum = '';
    }

    const Result = {
        shopInfoObj : shopResult[0],
        shopPhotoUrlList : shopUrlListResult
    }
    connection.release();

    return Result;

};


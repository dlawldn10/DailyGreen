const shopProvider = require("../../app/Shop/shopProvider");
const shopService = require("../../app/Shop/shopService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

//상점 전체 조회
exports.getShopList = async function (req, res){

    let page = req.query.page;
    const userIdxFromJWT = req.verifiedToken.userIdx;

    const limit = 5;

    if (!userIdxFromJWT)
        return res.send(errResponse(baseResponse.TOKEN_EMPTY));

    if(limit-page < 0){

        page = 0;

    }else if(page == 0 || !page){

        return res.send(errResponse(baseResponse.PAGECOUNT_WRONG));
    }else{

        page = (page-1)*limit

    }

    const postsFromFollowingUsers = await shopProvider.retrieveShopList(userIdxFromJWT, page, limit);
    return res.send(response(baseResponse.SUCCESS, postsFromFollowingUsers));

}

//관심상점 조회
exports.getLikedShopList = async function (req, res){

    let page = req.query.page;
    const userIdxFromJWT = req.verifiedToken.userIdx;

    const limit = 5;

    if (!userIdxFromJWT)
        return res.send(errResponse(baseResponse.TOKEN_EMPTY));

    if(limit-page < 0){

        page = 0;

    }else if(page == 0 || !page){

        return res.send(errResponse(baseResponse.PAGECOUNT_WRONG));
    }else{

        page = (page-1)*limit

    }

    const postsFromFollowingUsers = await shopProvider.retrieveLikedShopList(userIdxFromJWT, page, limit);
    return res.send(response(baseResponse.SUCCESS, postsFromFollowingUsers));

}


//상점 상세 조회
exports.getShop = async function (req, res){

    const userIdxFromJWT = req.verifiedToken.userIdx;
    const shopIdx = req.params.shopIdx;



    if (!userIdxFromJWT)
        return res.send(errResponse(baseResponse.TOKEN_EMPTY));
    else if (!shopIdx)
        return res.send(errResponse(baseResponse.SHOPIDX_EMPTY));


    const postsFromFollowingUsers = await shopProvider.retrieveShop(userIdxFromJWT, shopIdx);
    return res.send(response(baseResponse.SUCCESS, postsFromFollowingUsers));

}


//관심 상점 추가
exports.postShopLike = async function (req, res){

    const userIdxFromJWT = req.verifiedToken.userIdx;
    const shopIdx = req.body.shopIdx;



    if (!userIdxFromJWT)
        return res.send(errResponse(baseResponse.TOKEN_EMPTY));
    else if (!shopIdx)
        return res.send(errResponse(baseResponse.SHOPIDX_EMPTY));


    const createShopLikeResult = await shopService.createShopLike(userIdxFromJWT, shopIdx);
    return res.send(createShopLikeResult);

}

const jwtMiddleware = require("../../../config/jwtMiddleware");
const shop = require("./shopController");
const multer = require("multer");
module.exports = function(app) {
    const shop = require('./shopController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    const multer = require("multer");
    const upload = multer({ storage: multer.memoryStorage() });



    //상점 전체 조회
    app.get('/app/shops', jwtMiddleware, shop.getShopList);

    //관심상점 조회
    app.get('/app/shops/likes', jwtMiddleware, shop.getLikedShopList);

    //상점 상세 조회
    app.get('/app/shops/:shopIdx', jwtMiddleware, shop.getShop);

    //관심상점 추가
    app.post('/app/shops/likes', jwtMiddleware, upload.none(), shop.postShopLike);

    //상점 검색
    app.get('/app/searches/shops', jwtMiddleware, shop.getSearchedShopList);


}
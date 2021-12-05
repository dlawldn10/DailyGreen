

//상점 전체 조회
async function selectShopList(connection, userIdx, limit, page) {

    const selectClubsQuery = `
        SELECT S.shopIdx, S.shopName,
               S.locationDetail, CPU.url,
               (SELECT COUNT(*) as isShopLiked FROM ShopLikes WHERE status = 'ACTIVE' AND userIdx = ? AND shopIdx = S.shopIdx) as isShopLiked
        FROM Shops S
                 LEFT JOIN (SELECT shopIdx, url FROM ShopPhotoUrls GROUP BY shopIdx) CPU on S.shopIdx = CPU.shopIdx
        WHERE S.status = 'ACTIVE'
        ORDER BY S.createdAt DESC LIMIT ?
        OFFSET ?;
    `;

    const selectClubListRow = await connection.query(
        selectClubsQuery,
        [userIdx, limit, page]
    );

    return selectClubListRow[0];

}

//관심상점 조회
async function selectLikedShopList(connection, userIdx, limit, page) {

    const selectClubsQuery = `
        SELECT S.shopIdx, S.shopName,
               S.locationDetail, CPU.url
        FROM ShopLikes SL
                 LEFT JOIN (SELECT shopIdx, url FROM ShopPhotoUrls GROUP BY shopIdx) CPU on SL.shopIdx = CPU.shopIdx
                 LEFT JOIN (SELECT shopIdx, shopName, locationDetail, status, createdAt FROM Shops) S on S.shopIdx = SL.shopIdx
        WHERE S.status = 'ACTIVE' AND SL.userIdx = ? AND SL.status = 'ACTIVE'
        ORDER BY S.createdAt DESC LIMIT ? OFFSET ?;
    `;

    const selectClubListRow = await connection.query(
        selectClubsQuery,
        [userIdx, limit, page]
    );

    return selectClubListRow[0];

}


//상점 상세조회
async function selectShop(connection, userIdx, shopIdx) {

    const selectClubsQuery = `
        SELECT S.shopIdx, U.userIdx, U.nickname, U.profilePhotoUrl,
               S.shopName, S.locationDetail,
               CASE LENGTH(S.phoneNum)
                   WHEN 11
                       THEN CONCAT(LEFT(S.phoneNum, 3), '-', MID(S.phoneNum, 4, 4), '-', RIGHT(S.phoneNum, 4))
                   WHEN 10
                       THEN CONCAT(LEFT(S.phoneNum, 3), '-', MID(S.phoneNum, 4, 3), '-', RIGHT(S.phoneNum, 4))
                   END AS phoneNum,
               S.website, S.bio, ifnull(SL.isShopLiked, 0) as isShopLiked
        FROM Shops S
                 LEFT JOIN (SELECT userIdx, nickname, profilePhotoUrl FROM Users) U on S.userIdx = U.userIdx
                 LEFT JOIN (SELECT shopIdx, COUNT(*) as isShopLiked FROM ShopLikes WHERE status = 'ACTIVE' AND userIdx = ? AND shopIdx = ?) SL on SL.shopIdx = S.shopIdx
        WHERE S.status = 'ACTIVE' AND S.shopIdx = ?;
    `;

    const selectClubListRow = await connection.query(
        selectClubsQuery,
        [userIdx, shopIdx, shopIdx]
    );

    return selectClubListRow[0];

}

//상점 사진들 상세조회
async function selectShopPhotoUrls(connection, shopIdx) {

    const selectClubsQuery = `
        SELECT url FROM ShopPhotoUrls WHERE status = 'ACTIVE' AND shopIdx = ?;
    `;

    const selectClubListRow = await connection.query(
        selectClubsQuery,
        shopIdx
    );

    return selectClubListRow[0];

}

//좋아요를 한 적이 있는지 알아보기
async function selectIfLikeExist(connection, accountIdx, shopIdx) {
    const selectTagQuery = `
        SELECT status FROM ShopLikes WHERE userIdx =? AND shopIdx =?;
    `;

    const selectTagRow = await connection.query(
        selectTagQuery,
        [accountIdx, shopIdx]
    );

    return selectTagRow[0];


}



//좋아요 저장
async function insertLikeInfo(connection, userIdx, shopIdx) {
    //태그들을 저장한다.
    const insertLikeQuery = `
        INSERT INTO ShopLikes(userIdx, shopIdx) VALUES (?, ?);
    `;


    const insertLikeRow = await connection.query(
        insertLikeQuery,
        [userIdx, shopIdx]
    );

    return insertLikeRow[0];
}

//좋아요 업데이트
async function updateLikeInfo(connection, userIdx, shopIdx, status) {
    const updateLikeQuery = `
        UPDATE ShopLikes SET status = ? WHERE userIdx =? AND shopIdx =?;
    `;


    const updateLikeRow = await connection.query(
        updateLikeQuery,
        [status, userIdx, shopIdx]
    );

    return updateLikeRow[0];
}

//상점 검색
async function selectSearchedShopList(connection, limit, page, keyword, userIdx) {

    const selectClubsQuery = `
        SELECT S.shopIdx, S.shopName,
               S.locationDetail, CPU.url,
               (SELECT COUNT(*) as isShopLiked FROM ShopLikes WHERE status = 'ACTIVE' AND userIdx = ? AND shopIdx = S.shopIdx) as isShopLiked
        FROM Shops S
                 LEFT JOIN (SELECT shopIdx, url FROM ShopPhotoUrls GROUP BY shopIdx) CPU on S.shopIdx = CPU.shopIdx
        WHERE S.status = 'ACTIVE' AND S.shopName LIKE '%${keyword}%'
        ORDER BY S.updatedAt DESC LIMIT ?
        OFFSET ?;
    `;

    const selectClubListRow = await connection.query(
        selectClubsQuery,
        [userIdx, limit, page]
    );

    return selectClubListRow[0];

}




module.exports = {
    selectShopList,
    selectLikedShopList,
    selectShop,
    selectShopPhotoUrls,
    selectIfLikeExist,
    insertLikeInfo,
    updateLikeInfo,
    selectSearchedShopList

}
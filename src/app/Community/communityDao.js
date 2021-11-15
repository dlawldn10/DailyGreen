

async  function insertCommunityFollow(connection, userIdxFromJWT, communityIdx) {
    const insertCommunityFollowQuery = `
        INSERT INTO CommunityFollowings(fromUserIdx, toCommunityIdx)
        VALUES (?, ?);
    `;
    const insertCommunityFollowRow = await connection.query(
        insertCommunityFollowQuery,
        [userIdxFromJWT, communityIdx]
    );
    return insertCommunityFollowRow[0];

}

async function selectCommunityByCommunityIdx(connection, communityIdx){
    const selectCommunityQuery = `
        SELECT communityName FROM Communities WHERE communityIdx = ?;
    `;
    const [selectCommunityRow] = await connection.query(selectCommunityQuery, communityIdx);
    return selectCommunityRow[0];
}

async function selectIfCommunityFollowing(connection, userIdxFromJWT, communityIdx){
    const selectCommunityFollowQuery = `
    SELECT status FROM CommunityFollowings WHERE toCommunityIdx = ? AND fromUserIdx = ?;
  `;
    const [selectCommunityRow] = await connection.query(selectCommunityFollowQuery, [communityIdx, userIdxFromJWT]);
    return selectCommunityRow[0];
}

async function updateCommunityFollow(connection, userIdxFromJWT, communityIdx, newStatus){
    const updateCommunityFollowQuery = `
    UPDATE CommunityFollowings SET status = ? WHERE fromUserIdx = ? AND toCommunityIdx = ?;
  `;
    const [selectCommunityRow] = await connection.query(updateCommunityFollowQuery,
        [newStatus, userIdxFromJWT, communityIdx]
    );

    return selectCommunityRow[0];
}


// 특정 유저가 참여중인 커뮤니티 리스트
async function selectMyCommunities(connection, userIdx) {
    const selectUserAccountQuery = `
        SELECT CF.toCommunityIdx as communityIdx,
               C.communityName FROM CommunityFollowings CF
                                        LEFT JOIN (SELECT communityName, communityIdx FROM Communities) C on CF.toCommunityIdx = C.communityIdx
        WHERE CF.fromUserIdx = ? AND CF.status = 'ACTIVE'
        GROUP BY CF.toCommunityIdx;
    `;
    const selectUserAccountRow = await connection.query(
        selectUserAccountQuery,
        userIdx
    );
    return selectUserAccountRow[0];

};


// 특정 커뮤니티에 참여중인 사람들 3명의 프사
async function selectCommunityFollowingUsersProfilePhoto(connection, communityIdx) {
    const selectProfilePhotoQuery = `
        SELECT U.profilePhotoUrl FROM Users U
                                          LEFT JOIN (SELECT toCommunityIdx, fromUserIdx, updatedAt, status FROM CommunityFollowings) CF on CF.fromUserIdx = U.userIdx
        WHERE CF.toCommunityIdx = ? AND CF.status = 'ACTIVE' AND U.status = 'ACTIVE'
        ORDER BY CF.updatedAt DESC LIMIT 3;
    `;
    const selectProfilePhotoRow = await connection.query(
        selectProfilePhotoQuery,
        communityIdx
    );
    return selectProfilePhotoRow[0];

};


//특정 커뮤니티를 구독중인 사람들의 수
async function selectCommunityFollowingUsersCount(connection, communityIdx) {
    const selectProfilePhotoQuery = `
        SELECT COUNT(toCommunityIdx) as totalFollowers FROM CommunityFollowings CF
        WHERE CF.toCommunityIdx = ? AND CF.status = 'ACTIVE';
    `;
    const selectProfilePhotoRow = await connection.query(
        selectProfilePhotoQuery,
        communityIdx
    );
    return selectProfilePhotoRow[0];

};


module.exports = {
    insertCommunityFollow,
    selectCommunityByCommunityIdx,
    selectIfCommunityFollowing,
    updateCommunityFollow,
    selectMyCommunities,
    selectCommunityFollowingUsersProfilePhoto,
    selectCommunityFollowingUsersCount

};


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
    SELECT status FROM CommunityFollowings WHERE toCommunityIdx = ?;
  `;
    const [selectCommunityRow] = await connection.query(selectCommunityFollowQuery, communityIdx);
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


module.exports = {
    insertCommunityFollow,
    selectCommunityByCommunityIdx,
    selectIfCommunityFollowing,
    updateCommunityFollow

};
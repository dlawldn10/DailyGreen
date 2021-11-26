
async function insertMessage(connection, fromUserIdx, toUserIdx, msg) {
    const insertMessageQuery = `
        INSERT INTO Messages(fromUserIdx, toUserIdx, content)
        VALUES(?, ?, ?);
    `;


    const insertMessageRow = await connection.query(
        insertMessageQuery,
        [fromUserIdx, toUserIdx, msg]
    );

    return insertMessageRow[0];
}


async function selectMessageHistory(connection, fromUserIdx, toUserIdx) {
    const selectMessageQuery = `
        SELECT content, date_format(updatedAt, '%H:%i:%s') as time FROM Messages M
        WHERE (fromUserIdx = ? OR toUserIdx = ?) OR (fromUserIdx = ? AND toUserIdx = ?)
        ORDER BY updatedAt ASC;
    `;


    const selectMessageRow = await connection.query(
        selectMessageQuery,
        [fromUserIdx, toUserIdx, toUserIdx, fromUserIdx]
    );

    return selectMessageRow[0];
}

async function selectToUserProfile(connection, toUserIdx) {
    const selectMessageQuery = `
        SELECT nickname, profilePhotoUrl FROM Users 
        WHERE userIdx = ?;
    `;


    const selectMessageRow = await connection.query(
        selectMessageQuery,
        toUserIdx
    );

    return selectMessageRow[0];
}

async function selectChatRoomUserList(connection, fromUserIdx) {
    const selectMessageQuery = `
        SELECT M.toUserIdx, U.nickname, U.profilePhotoUrl FROM Messages M
        LEFT JOIN (SELECT userIdx, nickname, profilePhotoUrl FROM Users) U on U.userIdx = M.toUserIdx
        WHERE M.fromUserIdx = ?
        GROUP BY M.toUserIdx;
    `;


    const selectMessageRow = await connection.query(
        selectMessageQuery,
        fromUserIdx
    );

    return selectMessageRow[0];
}


async function selectChatPreview(connection, fromUserIdx, toUserIdx) {
    const selectMessageQuery = `
        SELECT content, date_format(updatedAt, '%l:%i %p') as time FROM Messages
        WHERE (fromUserIdx = ? AND toUserIdx = ?) OR (fromUserIdx = ? AND toUserIdx = ?)
        ORDER BY updatedAt DESC LIMIT 1;
    `;


    const selectMessageRow = await connection.query(
        selectMessageQuery,
        [fromUserIdx, toUserIdx, toUserIdx, fromUserIdx]
    );

    return selectMessageRow[0];
}

module.exports = {
    insertMessage,
    selectMessageHistory,
    selectToUserProfile,
    selectChatRoomUserList,
    selectChatPreview
}
//모임 정보 삽입
async function insertWorkshopInfo(connection, insertClubInfoParams) {
    const selectProfilePhotoQuery = `
        INSERT INTO Workshops(communityIdx, userIdx, workshopName,
                          bio, maxPeopleNum, \`when\`,
                          locationIdx, locationDetail, kakaoChatLink)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
    const selectProfilePhotoRow = await connection.query(
        selectProfilePhotoQuery,
        insertClubInfoParams
    );
    return selectProfilePhotoRow[0];

};

//모임 사진 삽입
async function insertWorkshopPhotoUrl(connection, clubIdx, userIdx, url) {
    const selectProfilePhotoQuery = `
        INSERT INTO WorkshopPhotoUrls(workshopIdx, userIdx, url)
        VALUES(?, ?, ?);
        `;
    const selectProfilePhotoRow = await connection.query(
        selectProfilePhotoQuery,
        [clubIdx, userIdx, url]
    );
    return selectProfilePhotoRow[0];

};


//해시태그 삽입
async function insertHashTag(connection, tagName) {
    const insertHashTagQuery = `
        INSERT INTO HashTags(tagName) VALUES (?) ON DUPLICATE KEY UPDATE tagName = ?;
        `;
    const insertHashTagRow = await connection.query(
        insertHashTagQuery,
        [tagName, tagName]
    );
    return insertHashTagRow[0];

};

//입력한 태그들의 tagIdx 알아내기
async function selectTagByTagName(connection, tagName) {
    //for 문으로 입력한 태그들의 인덱스를 가져온다.
    const selectTagQuery = `
        SELECT tagIdx FROM HashTags WHERE tagName = ? AND status = 'ACTIVE';
    `;

    const selectTagRow = await connection.query(
        selectTagQuery,
        tagName
    );

    return selectTagRow[0];
}

//모임 태그에 등록하기
async function insertWorkshopHashTags(connection, tagIdx, clubIdx) {

    const insertStoryTagQuery = `
        INSERT INTO WorkshopHashTags(tagIdx, workshopIdx) VALUES (?, ?);
    `;

    const insertStoryTagRow = await connection.query(
        insertStoryTagQuery,
        [tagIdx, clubIdx]
    );

    return insertStoryTagRow[0];
}

//모임 회비 정보 넣기
async function insertWorkshopFeeInfo(connection, clubIdx, fee, feeType) {

    const insertFeeInfoQuery = `
        INSERT INTO WorkshopEntranceFees(workshopIdx, fee, feeType)
        VALUES (?, ?, ?);
    `;

    const insertFeeInfoRow = await connection.query(
        insertFeeInfoQuery,
        [clubIdx, fee, feeType]
    );

    return insertFeeInfoRow[0];
}



module.exports = {
    insertWorkshopInfo,
    insertWorkshopPhotoUrl,
    insertHashTag,
    selectTagByTagName,
    insertWorkshopHashTags,
    insertWorkshopFeeInfo

};
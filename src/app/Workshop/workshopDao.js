//워크샵 정보 삽입
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

//워크샵 사진 삽입
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
        INSERT IGNORE INTO HashTags(tagName) VALUES (?);
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

//워크샵 태그에 등록하기
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

//워크샵 회비 정보 넣기
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


//워크샵탭 조회
async function selectWorkshopList(connection, communityIdx, limit, page) {

    const selectWorkshopsQuery = `
        SELECT C.workshopIdx,
               C.userIdx,
               U.nickname,
               U.profilePhotoUrl,
               C.workshopName,
               C.locationDetail,
               C.maxPeopleNum,
               C.bio,
               date_format(C.when, '%Y-%m-%d %h:%i') as \`when\`,
               case WEEKDAY(C.\`when\`)
                   when '0' then '월요일'
                   when '1' then '화요일'
                   when '2' then '수요일'
                   when '3' then '목요일'
                   when '4' then '금요일'
                   when '5' then '토요일'
                   when '6' then '일요일'
                   end as day, DATEDIFF(date(C.\`when\`), now()) as Dday,
       CPU.url as workshopPhoto
        FROM Workshops C
            LEFT JOIN (SELECT userIdx, nickname, profilePhotoUrl, status FROM Users) U
        on C.userIdx = U.userIdx
            LEFT JOIN (SELECT workshopIdx, url FROM WorkshopPhotoUrls GROUP BY workshopIdx) CPU on C.workshopIdx = CPU.workshopIdx
        WHERE C.status = 'ACTIVE' AND U.status = 'ACTIVE' AND C.communityIdx = ?
        ORDER BY C.updatedAt DESC LIMIT ?
        OFFSET ?;
    `;

    const selectWorkshopListRow = await connection.query(
        selectWorkshopsQuery,
        [communityIdx, limit, page]
    );

    return selectWorkshopListRow[0];

}

//워크샵탭 조회 - 참여중인 사람들의 프사 최신순 탑3 조회
async function selectThreeFollowingUsersProfilePhotos(connection, workshopIdx) {

    const selectProfilePhotoUrlQuery = `
        SELECT U.profilePhotoUrl FROM WorkshopFollowings CF
        LEFT JOIN (SELECT userIdx, profilePhotoUrl FROM Users) U ON userIdx = CF.fromUserIdx
        WHERE CF.toWorkshopIdx = ?
        ORDER BY CF.updatedAt DESC LIMIT 3;
    `;

    const selectUserProfileRow = await connection.query(
        selectProfilePhotoUrlQuery,
        workshopIdx
    );

    return selectUserProfileRow[0];

}

//워크샵탭 조회 - 모임에 달린 태그들 조회
async function selectWorkshopTags(connection, workshopIdx) {

    const selectHashTagsQuery = `
        SELECT HT.tagName
        FROM WorkshopHashTags CHT
        LEFT JOIN (SELECT tagIdx, tagName, status FROM HashTags) HT ON CHT.tagIdx = HT.tagIdx
        WHERE CHT.workshopIdx = ? AND CHT.status = 'ACTIVE' AND HT.status = 'ACTIVE';
    `;

    const selectHashTagsRow = await connection.query(
        selectHashTagsQuery,
        workshopIdx
    );

    return selectHashTagsRow[0];

}

//워크샵탭 조회 - 모임에 참여하고있는 사람들 수 조회
async function selectWorkshopFollowers(connection, workshopIdx) {

    const selectWorkshopFollowersQuery = `
        SELECT COUNT(*) as nowFollowing FROM WorkshopFollowings CF WHERE CF.toWorkshopIdx = ?;
    `;

    const selectWorkshopFollowersRow = await connection.query(
        selectWorkshopFollowersQuery,
        workshopIdx
    );

    return selectWorkshopFollowersRow[0];

}


async function selectWorkshopByWorkshopIdx(connection, workshopIdx){

    const selectWorkshopQuery = `
        SELECT C.workshopIdx,
               C.userIdx,
               U.nickname,
               U.profilePhotoUrl,
               C.workshopName,
               C.locationDetail,
               C.maxPeopleNum,
               C.bio,
               date_format(C.when, '%Y-%m-%d %h:%i') as \`when\`,
               case WEEKDAY(C.\`when\`)
                   when '0' then '월요일'
                   when '1' then '화요일'
                   when '2' then '수요일'
                   when '3' then '목요일'
                   when '4' then '금요일'
                   when '5' then '토요일'
                   when '6' then '일요일'
                   end as day,
       DATEDIFF(date(C.\`when\`), now()) as Dday,
       CEF.feeType,
       CEF.fee
        FROM Workshops C
            LEFT JOIN (SELECT userIdx, nickname, profilePhotoUrl, status FROM Users) U on C.userIdx = U.userIdx
            LEFT JOIN (SELECT workshopIdx, feeType, fee FROM WorkshopEntranceFees) CEF on C.workshopIdx = CEF.workshopIdx
        WHERE C.status = 'ACTIVE' AND U.status = 'ACTIVE' AND C.workshopIdx = ?;
    `;

    const selectClubRow = await connection.query(
        selectWorkshopQuery,
        workshopIdx
    );

    return selectClubRow[0];

}

//워크샵 상세 조회 - 참여중인 모든 사람들의 프사와 닉네임
async function selectFollowingUsersProfile(connection, workshopIdx) {

    const selectUserProfileQuery = `
        SELECT U.profilePhotoUrl, U.nickname FROM WorkshopFollowings CF
        LEFT JOIN (SELECT userIdx, profilePhotoUrl, nickname FROM Users) U ON userIdx = CF.fromUserIdx
        WHERE CF.toWorkshopIdx = ?
        ORDER BY CF.updatedAt DESC;
    `;

    const selectUserProfileRow = await connection.query(
        selectUserProfileQuery,
        workshopIdx
    );

    return selectUserProfileRow[0];

}

async function selectWorkshopPhotoUrls(connection, workshopIdx){
    const selectWorkshopPhotoQuery = `
        SELECT url as workshopPhotoUrl FROM WorkshopPhotoUrls CPU
        WHERE workshopIdx = ?;
    `;

    const selectWorkshopPhotoRow = await connection.query(
        selectWorkshopPhotoQuery,
        workshopIdx
    );

    return selectWorkshopPhotoRow[0];
}



module.exports = {
    insertWorkshopInfo,
    insertWorkshopPhotoUrl,
    insertHashTag,
    selectTagByTagName,
    insertWorkshopHashTags,
    insertWorkshopFeeInfo,
    selectWorkshopList,
    selectWorkshopFollowers,
    selectThreeFollowingUsersProfilePhotos,
    selectWorkshopTags,
    selectWorkshopByWorkshopIdx,
    selectWorkshopPhotoUrls,
    selectFollowingUsersProfile

};
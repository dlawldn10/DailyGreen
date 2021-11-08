//모임 정보 삽입
async function insertClubInfo(connection, insertClubInfoParams) {
    const selectProfilePhotoQuery = `
        INSERT INTO Clubs(communityIdx, userIdx, clubName,
                          bio, maxPeopleNum, \`when\`,
                          locationIdx, locationDetail, kakaoChatLink,
                          isRegular)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
    const selectProfilePhotoRow = await connection.query(
        selectProfilePhotoQuery,
        insertClubInfoParams
    );
    return selectProfilePhotoRow[0];

};

//모임 사진 삽입
async function insertClubPhotoUrl(connection, clubIdx, userIdx, url) {
    const selectProfilePhotoQuery = `
        INSERT INTO ClubPhotoUrls(clubIdx, userIdx, url)
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
async function insertClubHashTags(connection, tagIdx, clubIdx) {

    const insertStoryTagQuery = `
        INSERT INTO ClubHashTags(tagIdx, clubIdx) VALUES (?, ?);
    `;

    const insertStoryTagRow = await connection.query(
        insertStoryTagQuery,
        [tagIdx, clubIdx]
    );

    return insertStoryTagRow[0];
}

//모임 회비 정보 넣기
async function insertClubFeeInfo(connection, clubIdx, fee, feeType) {

    const insertFeeInfoQuery = `
        INSERT INTO ClubEntranceFees(clubIdx, fee, feeType)
        VALUES (?, ?, ?);
    `;

    const insertFeeInfoRow = await connection.query(
        insertFeeInfoQuery,
        [clubIdx, fee, feeType]
    );

    return insertFeeInfoRow[0];
}

//모임탭 조회
async function selectClubList(connection, limit, page) {

    const selectClubsQuery = `
        SELECT C.clubIdx,
               C.userIdx,
               U.nickname,
               U.profilePhotoUrl,
               C.clubName,
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
       CPU.url as clubPhoto
        FROM Clubs C
            LEFT JOIN (SELECT userIdx, nickname, profilePhotoUrl, status FROM Users) U
        on C.userIdx = U.userIdx
            LEFT JOIN (SELECT clubIdx, url FROM ClubPhotoUrls GROUP BY clubIdx) CPU on C.clubIdx = CPU.clubIdx
        WHERE C.status = 'ACTIVE' AND U.status = 'ACTIVE'
        ORDER BY C.updatedAt DESC LIMIT ?
        OFFSET ?;
    `;

    const selectClubListRow = await connection.query(
        selectClubsQuery,
        [limit, page]
    );

    return selectClubListRow[0];

}

//모임탭 조회 - 참여중인 사람들의 프사 최신순 탑3 조회
async function selectFollowingUsersProfilePhotos(connection, clubIdx) {

    const selectProfilePhotoUrlQuery = `
        SELECT U.profilePhotoUrl FROM ClubFollowings CF
        LEFT JOIN (SELECT userIdx, profilePhotoUrl FROM Users) U ON userIdx = CF.fromUserIdx
        WHERE CF.toClubIdx = ?
        ORDER BY CF.updatedAt DESC LIMIT 3;
    `;

    const selectUserProfileRow = await connection.query(
        selectProfilePhotoUrlQuery,
        clubIdx
    );

    return selectUserProfileRow[0];

}

//모임탭 조회 - 모임에 달린 태그들 조회
async function selectClubTags(connection, clubIdx) {

    const selectHashTagsQuery = `
        SELECT CHT.clubIdx, CHT.tagIdx, CHT.status,
               HT.tagName
        FROM ClubHashTags CHT
        LEFT JOIN (SELECT tagIdx, tagName, status FROM HashTags) HT ON CHT.tagIdx = HT.tagIdx
        WHERE CHT.clubIdx = ? AND CHT.status = 'ACTIVE' AND HT.status = 'ACTIVE';
    `;

    const selectHashTagsRow = await connection.query(
        selectHashTagsQuery,
        clubIdx
    );

    return selectHashTagsRow[0];

}

//모임탭 조회 - 모임에 참여하고있는 사람들 수 조회
async function selectClubFollowers(connection, clubIdx) {

    const selectClubFollowersQuery = `
        SELECT COUNT(*) as nowFollowing FROM ClubFollowings CF WHERE CF.toClubIdx = ?;
    `;

    const selectClubFollowersRow = await connection.query(
        selectClubFollowersQuery,
        clubIdx
    );

    return selectClubFollowersRow[0];

}


module.exports = {
    insertClubInfo,
    insertClubPhotoUrl,
    insertHashTag,
    selectTagByTagName,
    insertClubHashTags,
    insertClubFeeInfo,
    selectClubList,
    selectFollowingUsersProfilePhotos,
    selectClubTags,
    selectClubFollowers

};
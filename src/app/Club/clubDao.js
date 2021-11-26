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
        INSERT INTO HashTags(tagName) VALUES (?);
        `;
    const insertHashTagRow = await connection.query(
        insertHashTagQuery,
        tagName
    );
    return insertHashTagRow[0];

};

//입력한 태그들의 tagIdx 알아내기
async function selectTagByTagName(connection, tagName) {
    //for 문으로 입력한 태그들의 인덱스를 가져온다.
    const selectTagQuery = `
        SELECT tagIdx, COUNT(*) as Cnt FROM HashTags WHERE tagName = ? AND status = 'ACTIVE';
    `;

    const selectTagRow = await connection.query(
        selectTagQuery,
        tagName
    );

    return selectTagRow[0];
}

//모임 태그에 등록하기
async function insertClubTags(connection, tagIdx, clubIdx) {

    const insertClubTagQuery = `
        INSERT INTO ClubHashTags(tagIdx, clubIdx) VALUES (?, ?);
    `;

    const insertClubTagRow = await connection.query(
        insertClubTagQuery,
        [tagIdx, clubIdx]
    );

    return insertClubTagRow[0];
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
async function selectClubList(connection, communityIdx, userIdx, limit, page) {

    const selectClubsQuery = `
        SELECT C.isRegular,
               C.clubIdx,
               C.userIdx,
               U.nickname,
               U.profilePhotoUrl,
               C.clubName,
               C.locationDetail,
               C.maxPeopleNum,
               C.bio,
               CONCAT(date_format(C.when, '%Y.%m.%d '),
                      case WEEKDAY(C.\`when\`)
                          when '0' then '월요일'
                          when '1' then '화요일'
                          when '2' then '수요일'
                          when '3' then '목요일'
                          when '4' then '금요일'
                          when '5' then '토요일'
                          when '6' then '일요일'
                          end, ' ',
                      case date_format(C.when, '%p')
                          when 'PM' then '오후'
                          when 'AM' then '오전'
                          end, ' ',
                      date_format(C.when, '%l시'),
                      if(STRCMP(date_format(C.\`when\`, '%i'), '00') = 0, '',
                         date_format(C.\`when\`, ' %i분')))     as \`when\`,
               CONCAT('D-', DATEDIFF(date(C.\`when\`), now())) as Dday,
       CPU.url as clubPhoto
        FROM Clubs C
            LEFT JOIN (SELECT userIdx, nickname, profilePhotoUrl, status FROM Users) U
        on C.userIdx = U.userIdx
            LEFT JOIN (SELECT clubIdx, url FROM ClubPhotoUrls GROUP BY clubIdx) CPU on C.clubIdx = CPU.clubIdx
        WHERE C.status = 'ACTIVE' AND U.status = 'ACTIVE' AND C.communityIdx = ?
          AND C.userIdx not in (SELECT toUserIdx FROM BlockUsers WHERE fromUserIdx = ? )
          AND C.userIdx not in (SELECT fromUserIdx FROM BlockUsers WHERE toUserIdx = ? )
          AND DATEDIFF(date(C.\`when\`), now()) > 0
        ORDER BY C.updatedAt DESC LIMIT ?
        OFFSET ?;
    `;

    const selectClubListRow = await connection.query(
        selectClubsQuery,
        [communityIdx, userIdx, userIdx,limit, page]
    );

    return selectClubListRow[0];

}

//모임탭 조회 - 참여중인 사람들의 프사 최신순 탑3 조회
async function selectThreeFollowingUsersProfilePhotos(connection, clubIdx) {

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
        SELECT HT.tagName
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


async function selectClubByClubIdx(connection, clubIdx){

    const selectClubQuery = `
        SELECT C.clubIdx,
               C.userIdx,
               U.nickname,
               U.profilePhotoUrl,
               C.clubName,
               C.locationDetail,
               C.maxPeopleNum,
               C.bio,
               CONCAT(date_format(C.when, '%Y.%m.%d '),
                      case WEEKDAY(C.\`when\`)
                          when '0' then '월요일'
                          when '1' then '화요일'
                          when '2' then '수요일'
                          when '3' then '목요일'
                          when '4' then '금요일'
                          when '5' then '토요일'
                          when '6' then '일요일'
                          end, ' ',
                      case date_format(C.when, '%p')
                          when 'PM' then '오후'
                          when 'AM' then '오전'
                          end, ' ',
                      date_format(C.when, '%l시'),
                      if(STRCMP(date_format(C.\`when\`, '%i'), '00') = 0, '',
                         date_format(C.\`when\`, ' %i분')))     as \`when\`,
               CONCAT('D-', DATEDIFF(date(C.\`when\`), now())) as Dday,
               CEF.feeType,
               CONCAT(CEF.fee, '원') as fee
        FROM Clubs C
                 LEFT JOIN (SELECT userIdx, nickname, profilePhotoUrl, status FROM Users) U on C.userIdx = U.userIdx
                 LEFT JOIN (SELECT clubIdx, feeType, fee FROM ClubEntranceFees) CEF on C.clubIdx = CEF.clubIdx
        WHERE C.status = 'ACTIVE'
          AND U.status = 'ACTIVE'
          AND C.clubIdx = ?;
    `;

    const selectClubRow = await connection.query(
        selectClubQuery,
        clubIdx
    );

    return selectClubRow[0];

}

//모임 상세 조회 - 참여중인 모든 사람들의 프사와 닉네임
async function selectFollowingUsersProfile(connection, clubIdx) {

    const selectUserProfileQuery = `
        SELECT U.profilePhotoUrl, U.nickname FROM ClubFollowings CF
        LEFT JOIN (SELECT userIdx, profilePhotoUrl, nickname FROM Users) U ON userIdx = CF.fromUserIdx
        WHERE CF.toClubIdx = ?
        ORDER BY CF.updatedAt DESC;
    `;

    const selectUserProfileRow = await connection.query(
        selectUserProfileQuery,
        clubIdx
    );

    return selectUserProfileRow[0];

}

async function selectClubPhotoUrls(connection, clubIdx){
    const selectClubPhotoQuery = `
        SELECT url as clubPhotoUrl FROM ClubPhotoUrls CPU
        WHERE clubIdx = ?;
    `;

    const selectClubPhotoRow = await connection.query(
        selectClubPhotoQuery,
        clubIdx
    );

    return selectClubPhotoRow[0];
}


async function updateClubInfo(connection, updateClubInfoParams){
    const updateClubInfoQuery = `
        UPDATE Clubs SET communityIdx = ?, userIdx = ?, clubName =?,
                         bio = ?, maxPeopleNum = ?, \`when\` = ?,
                         locationIdx = ?, locationDetail = ?, kakaoChatLink =?,
                         isRegular = ? WHERE clubIdx = ? AND status = 'ACTIVE';
    `;

    const updateClubInfoRow = await connection.query(
        updateClubInfoQuery,
        updateClubInfoParams
    );

    return updateClubInfoRow[0];
}


async function updateClubFeeInfo(connection, clubIdx, fee, feeType){
    const updateClubFeeInfoQuery = `
        UPDATE ClubEntranceFees SET feeType = ?, fee = ? WHERE clubIdx = ? AND status = 'ACTIVE';
    `;

    const updateClubFeeInfoRow = await connection.query(
        updateClubFeeInfoQuery,
        [feeType, fee, clubIdx]
    );

    return updateClubFeeInfoRow[0];
}

async function updateClubTags(connection, newStatus, clubIdx){
    const updateClubFeeInfoQuery = `
        UPDATE ClubHashTags SET status = ? WHERE clubIdx = ? AND status = 'ACTIVE';
    `;

    const updateClubFeeInfoRow = await connection.query(
        updateClubFeeInfoQuery,
        [newStatus, clubIdx]
    );

    return updateClubFeeInfoRow[0];
}

async function selectClubTagBytagIdx(connection, clubIdx, tagIdx){
    const countClubTagsQuery = `
        SELECT COUNT(*) as Cnt FROM ClubHashTags WHERE clubIdx = ? AND tagIdx = ?;
    `;

    const updateClubFeeInfoRow = await connection.query(
        countClubTagsQuery,
        [clubIdx, tagIdx]
    );

    return updateClubFeeInfoRow[0];
}

async function updateOneClubTag(connection, newStatus, clubIdx, tagIdx){
    const updateClubFeeInfoQuery = `
        UPDATE ClubHashTags SET status = ? WHERE clubIdx = ? AND tagIdx = ?;
    `;

    const updateClubFeeInfoRow = await connection.query(
        updateClubFeeInfoQuery,
        [newStatus, clubIdx, tagIdx]
    );

    return updateClubFeeInfoRow[0];
}

async function selectHashTagBytagName(connection, tagName){
    const countClubTagsQuery = `
        SELECT COUNT(*) as Cnt FROM HashTags WHERE tagName = ?;
    `;

    const updateClubFeeInfoRow = await connection.query(
        countClubTagsQuery,
        tagName
    );

    return updateClubFeeInfoRow[0];
};


async function updateOneHashTag(connection, newStatus, tagName){
    const updateHashTagStatusQuery = `
        UPDATE HashTags SET status = ? WHERE tagName = ?;
    `;

    const updateHashTagStatusRow = await connection.query(
        updateHashTagStatusQuery,
        [newStatus, tagName]
    );

    return updateHashTagStatusRow[0];
}



//참가를 한 적이 있는지 알아보기
async function selectIfClubFollowExist(connection, userIdx, clubIdx) {
    const selectTagQuery = `
        SELECT status FROM ClubFollowings WHERE fromUserIdx =? AND toClubIdx =?;
    `;

    const selectTagRow = await connection.query(
        selectTagQuery,
        [userIdx, clubIdx]
    );

    return selectTagRow[0];


}


//참가 저장
async function insertClubFollowInfo(connection, userIdx, clubIdx) {

    const insertLikeQuery = `
        INSERT INTO ClubFollowings(fromUserIdx, toClubIdx) VALUES (?, ?);
    `;


    const insertLikeRow = await connection.query(
        insertLikeQuery,
        [userIdx, clubIdx]
    );

    return insertLikeRow[0];
}

//참가 업데이트
async function updateClubFollowInfo(connection, userIdx, clubIdx, status) {
    const updateLikeQuery = `
        UPDATE ClubFollowings SET status = ? WHERE fromUserIdx =? AND toClubIdx =?;
    `;


    const updateLikeRow = await connection.query(
        updateLikeQuery,
        [status, userIdx, clubIdx]
    );

    return updateLikeRow[0];
}


//모임 삭제
async function deleteClubInfo(connection, clubIdx) {

    const insertStoryTagQuery = `
        UPDATE Clubs SET status = 'DELETED' WHERE clubIdx = ?;
    `;

    const insertStoryTagRow = await connection.query(
        insertStoryTagQuery,
        clubIdx
    );


    return insertStoryTagRow[0];
}



//사진 url 삭제
async function deleteClubPhotoUrls(connection, clubIdx) {

    const insertStoryTagQuery = `
        UPDATE ClubPhotoUrls SET status = 'DELETED' WHERE clubIdx = ?;
    `;


    const insertStoryTagRow = await connection.query(
        insertStoryTagQuery,
        clubIdx
    );

    return insertStoryTagRow[0];
}


//모임에 붙은 태그 삭제
async function deleteClubTags(connection, clubIdx) {

    const insertStoryTagQuery = `
        UPDATE ClubHashTags SET status = 'DELETED' WHERE clubIdx = ?;
    `;


    const insertStoryTagRow = await connection.query(
        insertStoryTagQuery,
        clubIdx
    );

    return insertStoryTagRow[0];
}


//정기, 비정기 인지
async function selectClubType(connection, clubIdx) {

    const insertStoryTagQuery = `
        SELECT isRegular FROM Clubs WHERE clubIdx = ?;
    `;


    const insertStoryTagRow = await connection.query(
        insertStoryTagQuery,
        clubIdx
    );

    return insertStoryTagRow[0];
}

//모임 검색
async function selectSearchedClubList(connection, communityIdx, limit, page, keyword) {

    const selectClubsQuery = `
        SELECT C.isRegular,
               C.clubIdx,
               C.userIdx,
               U.nickname,
               U.profilePhotoUrl,
               C.clubName,
               C.locationDetail,
               C.maxPeopleNum,
               C.bio,
               CONCAT(date_format(C.when, '%Y.%m.%d '),
                      case WEEKDAY(C.\`when\`)
                          when '0' then '월요일'
                          when '1' then '화요일'
                          when '2' then '수요일'
                          when '3' then '목요일'
                          when '4' then '금요일'
                          when '5' then '토요일'
                          when '6' then '일요일'
                          end, ' ',
                      case date_format(C.when, '%p')
                          when 'PM' then '오후'
                          when 'AM' then '오전'
                          end, ' ',
                      date_format(C.when, '%l시'),
                      if(STRCMP(date_format(C.\`when\`, '%i'), '00') = 0, '',
                         date_format(C.\`when\`, ' %i분')))     as \`when\`,
               CONCAT('D-', DATEDIFF(date(C.\`when\`), now())) as Dday,
       CPU.url as clubPhoto
        FROM Clubs C
            LEFT JOIN (SELECT userIdx, nickname, profilePhotoUrl, status FROM Users) U
        on C.userIdx = U.userIdx
            LEFT JOIN (SELECT clubIdx, url FROM ClubPhotoUrls GROUP BY clubIdx) CPU on C.clubIdx = CPU.clubIdx
        WHERE C.status = 'ACTIVE' AND U.status = 'ACTIVE' AND C.communityIdx = ?
          AND DATEDIFF(date(C.\`when\`), now()) > 0 AND C.clubName LIKE '%${keyword}%'
        ORDER BY C.updatedAt DESC LIMIT ?
        OFFSET ?;
    `;

    const selectClubListRow = await connection.query(
        selectClubsQuery,
        [communityIdx, limit, page]
    );

    return selectClubListRow[0];

}



module.exports = {
    insertClubInfo,
    insertClubPhotoUrl,
    insertHashTag,
    selectTagByTagName,
    insertClubTags,
    insertClubFeeInfo,
    selectClubList,
    selectThreeFollowingUsersProfilePhotos,
    selectClubTags,
    selectClubFollowers,
    selectClubByClubIdx,
    selectFollowingUsersProfile,
    selectClubPhotoUrls,
    updateClubInfo,
    updateClubFeeInfo,
    updateClubTags,
    selectClubTagBytagIdx,
    updateOneClubTag,
    selectHashTagBytagName,
    updateOneHashTag,
    selectIfClubFollowExist,
    insertClubFollowInfo,
    updateClubFollowInfo,
    deleteClubInfo,
    deleteClubPhotoUrls,
    deleteClubTags,
    selectClubType,
    selectSearchedClubList

};
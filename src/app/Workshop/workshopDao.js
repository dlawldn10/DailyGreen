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

//워크샵 태그에 등록하기
async function insertWorkshopTags(connection, tagIdx, workshopIdx) {

    const insertStoryTagQuery = `
        INSERT INTO WorkshopHashTags(tagIdx, workshopIdx) VALUES (?, ?);
    `;

    const insertStoryTagRow = await connection.query(
        insertStoryTagQuery,
        [tagIdx, workshopIdx]
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
async function selectWorkshopList(connection, communityIdx, userIdx, limit, page) {

    const selectWorkshopsQuery = `
        SELECT C.workshopIdx,
               C.userIdx,
               U.nickname,
               U.profilePhotoUrl,
               C.workshopName,
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
       CPU.url as workshopPhoto
        FROM Workshops C
            LEFT JOIN (SELECT userIdx, nickname, profilePhotoUrl, status FROM Users) U
        on C.userIdx = U.userIdx
            LEFT JOIN (SELECT workshopIdx, url FROM WorkshopPhotoUrls GROUP BY workshopIdx) CPU on C.workshopIdx = CPU.workshopIdx
        WHERE C.status = 'ACTIVE' AND U.status = 'ACTIVE' AND C.communityIdx = ?
          AND C.userIdx not in (SELECT toUserIdx FROM BlockUsers WHERE fromUserIdx = ? )
          AND C.userIdx not in (SELECT fromUserIdx FROM BlockUsers WHERE toUserIdx = ? )
          AND DATEDIFF(date(C.\`when\`), now()) > 0
        ORDER BY C.updatedAt DESC LIMIT ?
        OFFSET ?;
    `;

    const selectWorkshopListRow = await connection.query(
        selectWorkshopsQuery,
        [communityIdx, userIdx, userIdx, limit, page]
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


async function updateWorkshopInfo(connection, updateWorkshopInfoParams){
    const updateWorkshopInfoQuery = `
        UPDATE Workshops SET communityIdx = ?, userIdx = ?, workshopName =?,
                         bio = ?, maxPeopleNum = ?, \`when\` = ?,
                         locationIdx = ?, locationDetail = ?, kakaoChatLink =?
        WHERE workshopIdx = ? AND status = 'ACTIVE';
    `;

    const updateClubInfoRow = await connection.query(
        updateWorkshopInfoQuery,
        updateWorkshopInfoParams
    );

    return updateClubInfoRow[0];
}


async function updateWorkshopFeeInfo(connection, workshopIdx, fee, feeType){
    const updateClubFeeInfoQuery = `
        UPDATE WorkshopEntranceFees SET feeType = ?, fee = ? WHERE workshopIdx = ? AND status = 'ACTIVE';
    `;

    const updateClubFeeInfoRow = await connection.query(
        updateClubFeeInfoQuery,
        [feeType, fee, workshopIdx]
    );

    return updateClubFeeInfoRow[0];
}


async function updateWorkshopTags(connection, newStatus, workshopIdx){
    const updateClubFeeInfoQuery = `
        UPDATE WorkshopHashTags SET status = ? WHERE workshopIdx = ? AND status = 'ACTIVE';
    `;

    const updateClubFeeInfoRow = await connection.query(
        updateClubFeeInfoQuery,
        [newStatus, workshopIdx]
    );

    return updateClubFeeInfoRow[0];
}


async function selectWorkshopTagBytagIdx(connection, workshopIdx, tagIdx){
    const countClubTagsQuery = `
        SELECT COUNT(*) as Cnt FROM WorkshopHashTags WHERE workshopIdx = ? AND tagIdx = ?;
    `;

    const updateClubFeeInfoRow = await connection.query(
        countClubTagsQuery,
        [workshopIdx, tagIdx]
    );

    return updateClubFeeInfoRow[0];
}

async function updateOneWorkshopTag(connection, newStatus, workshopIdx, tagIdx){
    const updateClubFeeInfoQuery = `
        UPDATE WorkshopHashTags SET status = ? WHERE workshopIdx = ? AND tagIdx = ?;
    `;

    const updateClubFeeInfoRow = await connection.query(
        updateClubFeeInfoQuery,
        [newStatus, workshopIdx, tagIdx]
    );

    return updateClubFeeInfoRow[0];
}


//참가를 한 적이 있는지 알아보기
async function selectIfWorkshopFollowExist(connection, userIdx, workshopIdx) {
    const selectTagQuery = `
        SELECT status FROM WorkshopFollowings WHERE fromUserIdx =? AND toWorkshopIdx =?;
    `;

    const selectTagRow = await connection.query(
        selectTagQuery,
        [userIdx, workshopIdx]
    );

    return selectTagRow[0];


}


//참가 저장
async function insertWorkshopFollowInfo(connection, userIdx, workshopIdx) {

    const insertLikeQuery = `
        INSERT INTO WorkshopFollowings(fromUserIdx, toWorkshopIdx) VALUES (?, ?);
    `;


    const insertLikeRow = await connection.query(
        insertLikeQuery,
        [userIdx, workshopIdx]
    );

    return insertLikeRow[0];
}

//참가 업데이트
async function updateWorkshopFollowInfo(connection, userIdx, workshopIdx, status) {
    const updateLikeQuery = `
        UPDATE WorkshopFollowings SET status = ? WHERE fromUserIdx =? AND toWorkshopIdx =?;
    `;


    const updateLikeRow = await connection.query(
        updateLikeQuery,
        [status, userIdx, workshopIdx]
    );

    return updateLikeRow[0];
}


//워크샵 삭제
async function deleteWorkshopInfo(connection, workshopIdx) {

    const insertStoryTagQuery = `
        UPDATE Workshops SET status = 'DELETED' WHERE workshopIdx = ?;
    `;

    const insertStoryTagRow = await connection.query(
        insertStoryTagQuery,
        workshopIdx
    );


    return insertStoryTagRow[0];
}



//사진 url 삭제
async function deleteWorkshopPhotoUrls(connection, workshopIdx) {

    const insertStoryTagQuery = `
        UPDATE WorkshopPhotoUrls SET status = 'DELETED' WHERE workshopIdx = ?;
    `;


    const insertStoryTagRow = await connection.query(
        insertStoryTagQuery,
        workshopIdx
    );

    return insertStoryTagRow[0];
}


//워크샵에 붙은 태그 삭제
async function deleteWorkshopTags(connection, workshopIdx) {

    const insertStoryTagQuery = `
        UPDATE WorkshopHashTags SET status = 'DELETED' WHERE workshopIdx = ?;
    `;


    const insertStoryTagRow = await connection.query(
        insertStoryTagQuery,
        workshopIdx
    );

    return insertStoryTagRow[0];
}


//워크샵 검색
async function selectSearchedWorkshopList(connection, communityIdx, limit, page, keyword) {

    const selectClubsQuery = `
        SELECT C.workshopIdx,
               C.userIdx,
               U.nickname,
               U.profilePhotoUrl,
               C.workshopName,
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
               CPU.url                                         as workshopPhoto
        FROM Workshops C
                 LEFT JOIN (SELECT userIdx, nickname, profilePhotoUrl, status FROM Users) U
                           on C.userIdx = U.userIdx
                 LEFT JOIN (SELECT workshopIdx, url FROM WorkshopPhotoUrls GROUP BY workshopIdx) CPU
                           on C.workshopIdx = CPU.workshopIdx
        WHERE C.status = 'ACTIVE'
          AND U.status = 'ACTIVE'
          AND C.communityIdx = ?
          AND DATEDIFF(date(C.\`when\`), now()) > 0 AND C.workshopName LIKE '%${keyword}%'
        ORDER BY C.updatedAt DESC
        LIMIT ? OFFSET ?;
    `;

    const selectClubListRow = await connection.query(
        selectClubsQuery,
        [communityIdx, limit, page]
    );

    return selectClubListRow[0];

}

module.exports = {
    insertWorkshopInfo,
    insertWorkshopPhotoUrl,
    insertHashTag,
    selectTagByTagName,
    insertWorkshopTags,
    insertWorkshopFeeInfo,
    selectWorkshopList,
    selectWorkshopFollowers,
    selectThreeFollowingUsersProfilePhotos,
    selectWorkshopTags,
    selectWorkshopByWorkshopIdx,
    selectWorkshopPhotoUrls,
    selectFollowingUsersProfile,
    updateWorkshopInfo,
    updateWorkshopFeeInfo,
    updateWorkshopTags,
    selectWorkshopTagBytagIdx,
    updateOneWorkshopTag,
    selectIfWorkshopFollowExist,
    insertWorkshopFollowInfo,
    updateWorkshopFollowInfo,
    deleteWorkshopInfo,
    deleteWorkshopPhotoUrls,
    deleteWorkshopTags,
    selectSearchedWorkshopList



};
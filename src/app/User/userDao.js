

// 닉네임 중복 확인
async function selectNickname(connection, nickname) {
  const selectNicknameQuery = `
    SELECT COUNT(*) as isRedundant FROM Users WHERE nickname = ?;
  `;
  const [accountRows] = await connection.query(selectNicknameQuery, nickname);
  return accountRows[0];
};



// 유저 생성
async function insertUserInfo(connection, userInfo) {
  const insertUserInfoQuery = `
    INSERT INTO Users(nickname, bio)
    VALUES (?, ?);
  `;
  const insertUserInfoRow = await connection.query(
      insertUserInfoQuery,
      [userInfo.nickname, userInfo.bio]
  );

  return insertUserInfoRow;
}



//계정 생성
async function insertAccountInfo(connection, insertAccountInfoParams) {
  const insertUserInfoQuery = `
    INSERT INTO Accounts(
      userIdx,
      sort,
      email,
      password,
      phoneNum
    )
    VALUES (?, ?, ?, ?, ?);
  `;
  const insertUserInfoRow = await connection.query(
      insertUserInfoQuery,
      insertAccountInfoParams
  );

  return insertUserInfoRow;
}



//팔로우 추가
async function insertFollows(connection, from, to) {
  console.log(from, to);
  const insertFollowInfoQuery = `
        INSERT INTO UserFollowings( fromUserIdx, toUserIdx) VALUES (?, ?);
`;
  const insertFollowInfoRow = await connection.query(
      insertFollowInfoQuery,
      [from, to]
  );

  return insertFollowInfoRow;
}



// 유저 계정 상태 체크
async function selectUserAccount(connection, accountInfoRowParams) {
  const selectUserAccountQuery = `
        SELECT status, userIdx, accountIdx, password
        FROM Accounts 
        WHERE sort = ? AND email = ?;`;
  const selectUserAccountRow = await connection.query(
      selectUserAccountQuery,
      accountInfoRowParams
  );

  return selectUserAccountRow[0];
};



// 간단 프로필 정보 가져오기 = 닉네임, 프사
async function selectSimpleUserProfile(connection, userIdx) {
  const selectUserAccountQuery = `
        SELECT nickname, profilePhotoUrl
        FROM Users 
        WHERE userIdx = ?;
        `;
  const selectUserAccountRow = await connection.query(
      selectUserAccountQuery,
      userIdx
  );
  return selectUserAccountRow[0];

};


// 가장 가까운 날 주최되는 이벤트(모임, 워크샵) 가져오기
async function selectCloseEvents(connection) {
  const selectUserAccountQuery = `(
    SELECT C.clubIdx as idx,
           C.clubName as name,
           C.locationDetail,
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
           DATEDIFF(date(C.\`when\`), now()) as Dday,
           CPU.url as photo,
           if(C.isRegular = 0 AND TN.table_name = 'Clubs', '모임', '정기모임') as type
    FROM Clubs C
             LEFT JOIN (SELECT clubIdx, url FROM ClubPhotoUrls GROUP BY clubIdx) CPU on C.clubIdx = CPU.clubIdx
            INNER JOIN (SELECT table_name FROM information_schema.TABLES WHERE TABLE_SCHEMA = SCHEMA() AND table_name LIKE '%Clubs%') TN
    WHERE C.status = 'ACTIVE' AND DATEDIFF(date(C.\`when\`), now()) > 0
)
UNION ALL
(
    SELECT C.workshopIdx as idx,
           C.workshopName as name,
           C.locationDetail,
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
           DATEDIFF(date(C.\`when\`), now()) as Dday,
           CPU.url as photo,
           if(TN.table_name = 'Workshops', '워크샵', '워크샵') as type
    FROM Workshops C
             LEFT JOIN (SELECT workshopIdx, url FROM WorkshopPhotoUrls GROUP BY workshopIdx) CPU on C.workshopIdx = CPU.workshopIdx
             INNER JOIN (SELECT table_name FROM information_schema.TABLES WHERE TABLE_SCHEMA = SCHEMA() AND table_name LIKE '%Workshops%') TN
    WHERE C.status = 'ACTIVE' AND DATEDIFF(date(C.\`when\`), now()) > 0
)
ORDER BY Dday ASC LIMIT 3 OFFSET 0;
        `;
  const selectUserAccountRow = await connection.query(
      selectUserAccountQuery
  );
  return selectUserAccountRow[0];

};



// 프사 삽입
async function insertProfilePhotoUrl(connection, photoUrl, userIdx) {
  const selectUserAccountQuery = `
    UPDATE Users SET profilePhotoUrl = ? WHERE userIdx = ?;
  `;
  const selectUserAccountRow = await connection.query(
      selectUserAccountQuery,
      [photoUrl, userIdx]
  );
  return selectUserAccountRow[0];
}




// 패스워드 체크
async function selectUserPassword(connection, selectUserPasswordParams) {
  const selectUserPasswordQuery = `
        SELECT password
        FROM Accounts 
        WHERE userIdx = ? AND accountIdx = ?;`;
  const selectUserPasswordRow = await connection.query(
      selectUserPasswordQuery,
      selectUserPasswordParams
  );

  return selectUserPasswordRow;
};



  module.exports = {
  insertUserInfo,
  selectUserAccount,
  selectNickname,
  insertAccountInfo,
  insertFollows,
  selectSimpleUserProfile,
  selectCloseEvents,
  insertProfilePhotoUrl,
  selectUserPassword

};



// 닉네임 중복 확인
async function selectNickname(connection, nickname) {
  const selectNicknameQuery = `
    SELECT COUNT(*) as isRedundant FROM Users WHERE nickname = ?;
  `;
  const [accountRows] = await connection.query(selectNicknameQuery, nickname);
  return accountRows[0];
};


// // 엑세스 토큰 중복 확인
// async function selectAccessToken(connection, userIdx, sort) {
//   const selectNicknameQuery = `
//     SELECT COUNT(case when userIdx = ? AND sort = ? then 1 end ) as isRedundant FROM AccessTokens;
//   `;
//   const [accountRows] = await connection.query(selectNicknameQuery, [userIdx, sort]);
//   return accountRows[0];
// };



// 유저 생성
async function insertUserInfo(connection, userInfo) {
  const insertUserInfoQuery = `
    INSERT INTO Users(profilePhotoUrl, nickname, bio)
    VALUES (?, ?, ?);
  `;
  const insertUserInfoRow = await connection.query(
      insertUserInfoQuery,
      [userInfo.profilePhoto, userInfo.nickname, userInfo.bio]
  );

  return insertUserInfoRow;
}


// //엑세스 토큰 삽입
// async function insertAccessTokenInfo(connection, userIdx, accessTokenInfo) {
//   const insertUserInfoQuery = `
//     INSERT INTO AccessTokens(userIdx, accessToken, sort)
//     VALUES (?, ?, ?);
//   `;
//   const insertUserInfoRow = await connection.query(
//       insertUserInfoQuery,
//       [userIdx, accessTokenInfo.accessToken, accessTokenInfo.sort]
//   );
//
//   return insertUserInfoRow;
// }


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

//계정명으로 계정인덱스 알아내기
async function selectAccountIdxByAccountName(connection, accountName) {
  const selectAccountIdx = `
        SELECT accountIdx FROM Accounts
        WHERE accountName = ?;
    `;
  const selectAccountIdxRow = await connection.query(
      selectAccountIdx,
      accountName
  );

  return selectAccountIdxRow[0];
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


// 패스워드 체크
async function selectUserPassword(connection, selectUserPasswordParams) {
  const selectUserPasswordQuery = `
        SELECT accountName, password
        FROM Accounts 
        WHERE accountName = ?;`;
  const selectUserPasswordRow = await connection.query(
      selectUserPasswordQuery,
      selectUserPasswordParams
  );

  return selectUserPasswordRow;
};

// 유저 계정 상태 체크 (jwt 생성 위해 id 값도 가져온다.)
async function selectUserAccount(connection, accountName) {
  const selectUserAccountQuery = `
        SELECT status, userIdx, accountIdx
        FROM Accounts 
        WHERE accountName = ?;`;
  const selectUserAccountRow = await connection.query(
      selectUserAccountQuery,
      accountName
  );
  return selectUserAccountRow[0];
};


// 프로필 정보 가져오기
async function selectAccountProfile(connection, accountIdx) {
  const selectUserAccountQuery = `
        SELECT accountIdx, profilePhotoUrl, name, accountName, bio
        FROM Accounts 
        WHERE accountIdx = ?;
        `;
  const selectUserAccountRow = await connection.query(
      selectUserAccountQuery,
      accountIdx
  );
  return selectUserAccountRow[0];
};


// 프로필 정보 수정하기
async function updateAccountProfileInfo(connection, accountIdx, reqBody) {
  const selectUserAccountQuery = `
    UPDATE Accounts SET accountName = ?, profilePhotoUrl = ?, name = ?, bio = ? WHERE accountIdx = ?;
        `;
  const selectUserAccountRow = await connection.query(
      selectUserAccountQuery,
      [reqBody.accountName, reqBody.profilePhotoUrl, reqBody.name, reqBody.bio, accountIdx]
  );
  return selectUserAccountRow[0];
};





module.exports = {
  insertUserInfo,
  selectUserPassword,
  selectUserAccount,
  selectNickname,
  insertAccountInfo,
  insertFollows,
  selectAccountIdxByAccountName,
  selectAccountProfile,
  updateAccountProfileInfo
  // selectAccessToken,
  // insertAccessTokenInfo

};

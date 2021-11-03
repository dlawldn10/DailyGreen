

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
    INSERT INTO Users(profilePhotoUrl, nickname, bio)
    VALUES (?, ?, ?);
  `;
  const insertUserInfoRow = await connection.query(
      insertUserInfoQuery,
      [userInfo.profilePhoto, userInfo.nickname, userInfo.bio]
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
        SELECT status, userIdx, accountIdx
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






module.exports = {
  insertUserInfo,
  selectUserAccount,
  selectNickname,
  insertAccountInfo,
  insertFollows,
  selectSimpleUserProfile

};

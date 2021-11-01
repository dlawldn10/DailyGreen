

// 계정명 중복 확인
async function selectAccountName(connection, accountName) {
  const selectAccountNameQuery = `
    SELECT accountName
    FROM Accounts
    WHERE accountName = ?;
  `;
  const [accountRows] = await connection.query(selectAccountNameQuery, accountName);
  return accountRows;
};



// 유저 생성
async function insertUserInfo(connection, fbAccessToken) {
  const insertUserInfoQuery = `
    INSERT INTO Users(fbAccessToken)
    VALUES (?);
  `;
  const insertUserInfoRow = await connection.query(
      insertUserInfoQuery,
      fbAccessToken
  );

  return insertUserInfoRow;
}

//계정 생성
async function insertAccountInfo(connection, insertAccountInfoParams) {
  const insertUserInfoQuery = `
    INSERT INTO Accounts(
      userIdx,
      accountName,
      password,
      name,
      profilePhotoUrl
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



//나 -나 팔로우 추가
async function insertFollows(connection, from, to) {
  console.log(from, to);
  const insertFollowInfoQuery = `
        INSERT INTO Follows(\`from\`,
          \`to\`
           )
VALUES (?, ?);
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
  selectAccountName,
  insertAccountInfo,
  insertFollows,
  selectAccountIdxByAccountName,
  selectAccountProfile,
  updateAccountProfileInfo

};

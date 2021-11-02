const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const userDao = require("./userDao");
const {errResponse, response} = require("../../../config/response");
const baseResponse = require("../../../config/baseResponseStatus");

// Provider: Read 비즈니스 로직 처리


//닉네임 중복 체크
exports.nicknameCheck = async function (nickname) {
  const connection = await pool.getConnection(async (conn) => conn);

  const accountRows = await userDao.selectNickname(connection, nickname);
  if (accountRows.isRedundant == 1){
    connection.release();
    return errResponse(baseResponse.SIGNUP_REDUNDANT_NICKNAME);
  }

  connection.release();
  return response(baseResponse.SUCCESS, "사용 가능한 닉네임 입니다.");
}


exports.accountNameCheck = async function (accountName) {
  const connection = await pool.getConnection(async (conn) => conn);
  const accountNameCheckResult = await userDao.selectAccountName(connection, accountName);
  connection.release();

  return accountNameCheckResult;
};



exports.passwordCheck = async function (selectUserPasswordParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const passwordCheckResult = await userDao.selectUserPassword(
      connection,
      selectUserPasswordParams
  );
  connection.release();
  return passwordCheckResult[0];
};

//계정 상태 체크
exports.accountCheck = async function (email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userAccountResult = await userDao.selectUserAccount(connection, email);
  connection.release();

  return userAccountResult;
};


//프로필 조회
exports.retrieveAccountProfile = async function (accountIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userAccountResult = await userDao.selectAccountProfile(connection, accountIdx);
  connection.release();

  return userAccountResult;
};



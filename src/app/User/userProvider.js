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
  return response(baseResponse.NICKNAME_VERIFICATION_SUCCESS);

}



//계정 상태 체크
exports.accountCheck = async function (accountInfoRowParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userAccountResult = await userDao.selectUserAccount(connection, accountInfoRowParams);
  connection.release();

  return userAccountResult;
};



//간단 유저정보 조회 = 프사, 닉네임
exports.retrieveUserProfile = async function (userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userAccountResult = await userDao.selectSimpleUserProfile(connection, userIdx);
  connection.release();

  return userAccountResult;
};


//홈화면 - 이벤트 배너
exports.retrieveEvents = async function (userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  await connection.beginTransaction();
  const selectCloseCommunityResult = await userDao.selectCloseClubs(connection);
  await connection.commit();
  await connection.release();

  return selectCloseCommunityResult;
};

//비밀번호 체크
exports.passwordCheck = async function (selectUserPasswordParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const passwordCheckResult = await userDao.selectUserPassword(
      connection,
      selectUserPasswordParams
  );
  connection.release();
  return passwordCheckResult[0];
};



//마이페이지
exports.retrieveMyPage = async function (userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectMyPageResult = await userDao.selectMyPage(connection, userIdx);
  const selectMyPageCntsResult = await userDao.selectMyPageCnts(connection, userIdx);
  const selectCreatedEventResult = await userDao.selectCreatedEvents(connection, userIdx);
  const selectMyPageEventResult = await userDao.selectParticipatingEvents(connection, userIdx);

  const exp = selectMyPageCntsResult[0].participationCnt*100
      + selectMyPageCntsResult[0].createdCWCnt*100
      + selectMyPageCntsResult[0].createdPostCnt*100;

  const myInfoObj = {
    participationCnt: selectMyPageCntsResult[0].participationCnt
        + selectMyPageCntsResult[0].createdCWCnt,

    createdPostCnt: selectMyPageCntsResult[0].createdPostCnt,

    badgeCnt: selectMyPageCntsResult[0].participationCnt*2
        + selectMyPageCntsResult[0].createdCWCnt*4
        + selectMyPageCntsResult[0].createdPostCnt*1,

    exp: exp
  }


  const Result = {
    myInfo : Object.assign({}, selectMyPageResult[0], myInfoObj),
    createdInfo: selectCreatedEventResult[0],
    participatingInfo: selectMyPageEventResult[0]
  }
  connection.release();

  return Result;
};

const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const userProvider = require("./userProvider");
const userDao = require("./userDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");

// Service: Create, Update, Delete 비즈니스 로직 처리

exports.createUser = async function (fbAccessToken, accountName, password, name) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {

        // 계정명 중복 확인
        const accountRows = await userProvider.accountNameCheck(accountName);
        if (accountRows.length > 0)
            return errResponse(baseResponse.SIGNUP_REDUNDANT_ACCOUNTNAME);

        // 비밀번호 암호화
        const hashedPassword = await crypto
            .createHash("sha512")
            .update(password)
            .digest("hex");


        await connection.beginTransaction();

        const insertUserResult = await userDao.insertUserInfo(connection, fbAccessToken);

        const insertAccountInfoParams = [insertUserResult[0].insertId, accountName, hashedPassword, name, 'http://poomasi.pushweb.kr/common/img/default_profile.png'];

        const insertAccountResult = await userDao.insertAccountInfo(connection, insertAccountInfoParams);
        const findAccountIdxResult = await userDao.selectAccountIdxByAccountName(connection, accountName);

        const insertFollowResult = await userDao.insertFollows(connection, findAccountIdxResult[0].accountIdx, findAccountIdxResult[0].accountIdx);

        await connection.commit();

        return response(baseResponse.SUCCESS);


    } catch (err) {
        await connection.rollback();
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }finally {
        connection.release();
    }
};


exports.postSignIn = async function (accountName, password) {
    try {
        // 계정 존재 확인
        const accountRows = await userProvider.accountNameCheck(accountName);
        if (accountRows.length < 1) return errResponse(baseResponse.SIGNIN_ACCOUNTNAME_WRONG);

        const selectAccountName = accountRows[0].accountName;

        // 비밀번호 확인
        const hashedPassword = await crypto
            .createHash("sha512")
            .update(password)
            .digest("hex");


        const selectUserPasswordParams = [selectAccountName, hashedPassword];
        const passwordRows = await userProvider.passwordCheck(selectUserPasswordParams);
        console.log(passwordRows[0].password);

        if (passwordRows[0].password !== hashedPassword) {
            return errResponse(baseResponse.SIGNIN_PASSWORD_WRONG);
        }

        // 계정 상태 확인
        const userInfoRows = await userProvider.accountCheck(accountName);
        console.log('계정 상태확인');

        if (userInfoRows[0].status === "INACTIVE") {
            return errResponse(baseResponse.SIGNIN_INACTIVE_ACCOUNT);
        } else if (userInfoRows[0].status === "DELETED") {
            return errResponse(baseResponse.SIGNIN_WITHDRAWAL_ACCOUNT);
        }


        //토큰 생성 Service
        let token = await jwt.sign(
            {
                userIdx: userInfoRows[0].userIdx,
                accountIdx: userInfoRows[0].accountIdx
            }, // 토큰의 내용(payload)
            secret_config.jwtsecret, // 비밀키
            {
                expiresIn: "365d",
                subject: "userInfo",
            } // 유효 기간 365일
        );

        return response(baseResponse.SUCCESS, {
            'userIdx': userInfoRows[0].userIdx,
            'accountIdx': userInfoRows[0].accountIdx,
            'jwt': token
        });

    } catch (err) {
        logger.error(`App - postSignIn Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};



//계정 프로필 수정
exports.updateAccountProfile = async function (accountIdx, reqBody) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {
        // 계정 프로필 정보 수정
        const accountRows = await userDao.updateAccountProfileInfo(connection, accountIdx, reqBody);
        const updatedAccountRows = await userDao.selectAccountProfile(connection, accountIdx);

        return updatedAccountRows;

    } catch (err) {
        logger.error(`App - updateAccountProfile Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};


//계정 추가
exports.postNewAccountInfo = async function (reqBody) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {

        // 계정명 중복 확인
        const accountRows = await userProvider.accountNameCheck(reqBody.accountName);
        if (accountRows.length > 0)
            return errResponse(baseResponse.SIGNUP_REDUNDANT_ACCOUNTNAME);

        // 비밀번호 암호화
        const hashedPassword = await crypto
            .createHash("sha512")
            .update(reqBody.password)
            .digest("hex");


        await connection.beginTransaction();

        const insertAccountInfoParams = [reqBody.userIdx, reqBody.accountName, hashedPassword, reqBody.name, 'http://poomasi.pushweb.kr/common/img/default_profile.png'];
        const insertAccountResult = await userDao.insertAccountInfo(connection, insertAccountInfoParams);

        const findAccountIdxResult = await userDao.selectAccountIdxByAccountName(connection, reqBody.accountName);

        const insertFollowResult = await userDao.insertFollows(connection, findAccountIdxResult[0].accountIdx, findAccountIdxResult[0].accountIdx);

        await connection.commit();

        return response(baseResponse.SUCCESS, findAccountIdxResult[0]);


    } catch (err) {
        await connection.rollback();
        logger.error(`App - postNewAccountInfo Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }finally {
        connection.release();
    }
};


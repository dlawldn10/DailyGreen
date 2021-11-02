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



//회원가입
exports.createUser = async function (userInfo, accessTokenInfo) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {

        // // 비밀번호 암호화
        // const hashedPassword = await crypto
        //     .createHash("sha512")
        //     .update(password)
        //     .digest("hex");


        await connection.beginTransaction();


        //유저 정보 삽입
        const insertUserResult = await userDao.insertUserInfo(connection, userInfo);



        //유저 인덱스, 액세스 토큰 인덱스, 계정 구분(네이버/카카오/애플), 이메일(임시), 비밀번호(임시), 휴대폰 번호(임시)
        const insertAccountInfoParams = [
            insertUserResult[0].insertId,
            accessTokenInfo.sort,
            accessTokenInfo.email,
            'tmpPassword',
            '00000000000'
        ];

        //계정 삽입
        const insertAccountResult = await userDao.insertAccountInfo(connection, insertAccountInfoParams);


        //나를 팔로우 하도록 삽입
        const insertFollowResult = await userDao.insertFollows(connection, insertAccountResult[0].insertId, insertAccountResult[0].insertId);

        await connection.commit();

        return response(baseResponse.SUCCESS, {
            'userIdx': insertUserResult[0].insertId,
            'accountIdx': insertAccountResult[0].insertId
        });

        // return response(baseResponse.SUCCESS);


    } catch (err) {

        await connection.rollback();
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);

    }finally {
        connection.release();
    }
};



//로그인
exports.postSignIn = async function (userIdx, accountIdx) {
    try {
        // 계정 존재 및 상태 확인
        const accountInfoRows = await userProvider.accountCheck(userIdx, accountIdx);
        console.log('계정 상태확인');

        if(accountInfoRows[0] === undefined){
            return errResponse(baseResponse.ACCOUNT_NOT_EXIST);
        }
        else if (accountInfoRows[0].status === "INACTIVE") {
            return errResponse(baseResponse.SIGNIN_INACTIVE_ACCOUNT);
        } else if (accountInfoRows[0].status === "DELETED") {
            return errResponse(baseResponse.SIGNIN_WITHDRAWAL_ACCOUNT);
        }

        //유저 정보 가져오기
        const userInfoRows = await userProvider.retrieveUserProfile(userIdx);

        //토큰 생성 Service
        let token = await jwt.sign(
            {
                userIdx: userIdx,
                accountIdx: accountIdx
            }, // 토큰의 내용(payload)
            secret_config.jwtsecret, // 비밀키
            {
                expiresIn: "365d",
                subject: "userInfo",
            } // 유효 기간 365일
        );

        return response(baseResponse.SUCCESS, {
            'nickname': userInfoRows[0].nickname,
            'profilePhotoUrl': userInfoRows[0].profilePhotoUrl,
            'jwt': token
        });

    } catch (err) {
        logger.error(`App - postSignIn Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};



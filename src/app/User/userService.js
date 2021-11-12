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
const admin = require("firebase-admin");
const serviceAccount = require("../../../dailygreen-6e49d-firebase-adminsdk-8g5gf-6d834b83b1.json");
const stream = require("stream");

let firebaseAdmin = admin;
if (!admin.apps.length) {
    firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'dailygreen-6e49d.appspot.com'
    });
}

// Service: Create, Update, Delete 비즈니스 로직 처리



//회원가입
exports.createUser = async function (sort, userInfo, accessTokenInfo) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {

        await connection.beginTransaction();
        // 계정 존재 및 상태 확인
        const accountInfoRowParams = [sort, accessTokenInfo.email];
        const accountInfoRows = await userProvider.accountCheck(accountInfoRowParams);

        if(accountInfoRows[0] === undefined) {

            //유저 정보 삽입
            const insertUserResult = await userDao.insertUserInfo(connection, userInfo);

            // 비밀번호 암호화
            const hashedPassword = await crypto
                .createHash("sha512")
                .update(userInfo.password)
                .digest("hex");

            //유저 인덱스, 계정 구분(네이버/카카오/애플), 이메일(임시), 비밀번호(임시), 휴대폰 번호(임시)
            const insertAccountInfoParams = [
                insertUserResult[0].insertId,
                sort,
                accessTokenInfo.email,
                hashedPassword,
                userInfo.phoneNum
            ];

            //계정 삽입
            const insertAccountResult = await userDao.insertAccountInfo(connection, insertAccountInfoParams);


            //프사 업로드
            const uploadProfilePhotoResult = await uploadToFirebaseStorage(connection, userInfo, insertUserResult[0].insertId);

            await connection.commit();

            return response(baseResponse.SUCCESS, {
                'userIdx': insertUserResult[0].insertId,
                'accountIdx': insertAccountResult[0].insertId
            });

        }else if (accountInfoRows[0].status === "INACTIVE") {
            return errResponse(baseResponse.SIGNIN_INACTIVE_ACCOUNT);
        }
        else if (accountInfoRows[0].status === "DELETED") {
            return errResponse(baseResponse.SIGNIN_WITHDRAWAL_ACCOUNT);
        }
        else if(accountInfoRows[0].status === "ACTIVE") {
            return errResponse(baseResponse.ACCOUNT_ALREADY_EXIST);
        }



    } catch (err) {

        await connection.rollback();
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);

    }finally {
        connection.release();
    }
};



//카카오 로그인
exports.postKakaoSignIn = async function (accessTokenInfo) {
    try {
        // 계정 존재 및 상태 확인
        const accountInfoRowParams = ['kakao', accessTokenInfo.email];
        const accountInfoRows = await userProvider.accountCheck(accountInfoRowParams);

        if(accountInfoRows[0] === undefined){
            return errResponse(baseResponse.ACCOUNT_NOT_EXIST);
        }
        else if (accountInfoRows[0].status === "INACTIVE") {
            return errResponse(baseResponse.SIGNIN_INACTIVE_ACCOUNT);
        }
        else if (accountInfoRows[0].status === "DELETED") {
            return errResponse(baseResponse.SIGNIN_WITHDRAWAL_ACCOUNT);
        }

        //유저 정보 가져오기
        const userInfoRows = await userProvider.retrieveUserProfile(accountInfoRows[0].userIdx);

        //토큰 생성 Service
        let token = await jwt.sign(
            {
                userIdx: accountInfoRows[0].userIdx,
                accountIdx: userInfoRows[0].accountIdx
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



//자체 로그인
exports.postOriginSignIn= async function (userInfo) {
    try {
        // 계정 존재 및 상태 확인
        const accountInfoRowParams = ['origin', userInfo.email];
        const accountInfoRows = await userProvider.accountCheck(accountInfoRowParams);

        if(accountInfoRows[0] === undefined){
            return errResponse(baseResponse.ACCOUNT_NOT_EXIST);
        }
        else if (accountInfoRows[0].status === "INACTIVE") {
            return errResponse(baseResponse.SIGNIN_INACTIVE_ACCOUNT);
        }
        else if (accountInfoRows[0].status === "DELETED") {
            return errResponse(baseResponse.SIGNIN_WITHDRAWAL_ACCOUNT);
        }

        // 비밀번호 확인
        const hashedPassword = await crypto
            .createHash("sha512")
            .update(userInfo.password)
            .digest("hex");


        if (accountInfoRows[0].password !== hashedPassword) {
            return errResponse(baseResponse.SIGNIN_PASSWORD_WRONG);
        }


        //유저 정보 가져오기
        const userInfoRows = await userProvider.retrieveUserProfile(accountInfoRows[0].userIdx);

        //토큰 생성 Service
        let token = await jwt.sign(
            {
                userIdx: userInfo.userIdx,
                accountIdx: userInfo.accountIdx
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


async function uploadToFirebaseStorage(connection, userInfo, userIdx) {
    //사진 업로드
    const bufferStream = new stream.PassThrough();
    bufferStream.end(new Buffer.from(userInfo.profilePhoto.buffer, 'ascii'));
    const fileName = Date.now() + `_${userIdx}`;

    const file = firebaseAdmin.storage().bucket().file('Users/ProfileImage/' + fileName);

    bufferStream.pipe(file.createWriteStream({

        metadata: {contentType: userInfo.profilePhoto.mimetype}

    })).on('error', (eer) => {

        console.log(eer);

    }).on('finish', () => {

        console.log(fileName + " finish");
        //업로드한 사진 url다운
        const config = {action: "read", expires: '03-17-2030'};
        file.getSignedUrl(config,
            async (err, url) => {
                if (err) {
                    console.log(err);
                }

                const insertProfilePhotoUrlRow = await userDao.insertProfilePhotoUrl(connection, url, userIdx);

            });
    });

}



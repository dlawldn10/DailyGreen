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
const admin = require("firebase-admin");
const serviceAccount = require('../../../secretKey/dailygreen-6e49d-firebase-adminsdk-8g5gf-6d834b83b1.json');
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
        let accountInfoRows = await userProvider.accountCheck(accountInfoRowParams);

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

            console.log({
                userIdx: insertUserResult[0].insertId,
                accountIdx: insertAccountResult[0].insertId
            });

            //유저 정보 가져오기
            const userInfoRows = await userDao.selectSimpleUserProfile(connection, insertUserResult[0].insertId);

            //토큰 생성 Service
            let token = await jwt.sign(
                {
                    userIdx: insertUserResult[0].insertId,
                    accountIdx: insertAccountResult[0].insertId
                }, // 토큰의 내용(payload)
                secret_config.jwtsecret, // 비밀키
                {
                    expiresIn: "365d",
                    subject: "userInfo",
                } // 유효 기간 365일
            );

            await connection.commit();


            return response(baseResponse.SUCCESS, {
                'userIdx': insertUserResult[0].insertId,
                'accountIdx': insertAccountResult[0].insertId,
                'nickname': userInfoRows[0].nickname,
                'profilePhotoUrl': userInfoRows[0].profilePhotoUrl,
                'jwt': token
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
            'userIdx': accountInfoRows[0].userIdx,
            'accountIdx': accountInfoRows[0].accountIdx,
            'nickname': userInfoRows[0].nickname,
            'profilePhotoUrl': userInfoRows[0].profilePhotoUrl,
            'jwt': token
        });

    } catch (err) {
        logger.error(`App - postSignIn Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};


//애플 로그인
exports.postAppleSignIn = async function (accessTokenInfo) {

    try {
        // 계정 존재 및 상태 확인
        const accountInfoRowParams = ['apple', accessTokenInfo.email];
        const accountInfoRows = await userProvider.accountCheck(accountInfoRowParams);

        if(accountInfoRows[0] === undefined){
            return {
                isSuccess: false,
                code: 3007,
                message: "존재하지 않는 계정입니다. 회원가입을 진행해 주세요.",
                email: "testEmail@email.com" };
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
            'userIdx': accountInfoRows[0].userIdx,
            'accountIdx': accountInfoRows[0].accountIdx,
            'nickname': userInfoRows[0].nickname,
            'profilePhotoUrl': userInfoRows[0].profilePhotoUrl,
            'jwt': token
        });

    } catch (err) {
        logger.error(`App - postAppleSignIn Service error\n: ${err.message} \n${JSON.stringify(err)}`);
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
                userIdx: accountInfoRows[0].userIdx,
                accountIdx: accountInfoRows[0].accountIdx
            }, // 토큰의 내용(payload)
            secret_config.jwtsecret, // 비밀키
            {
                expiresIn: "365d",
                subject: "userInfo",
            } // 유효 기간 365일
        );

        return response(baseResponse.SUCCESS, {
            'userIdx': accountInfoRows[0].userIdx,
            'accountIdx': accountInfoRows[0].accountIdx,
            'nickname': userInfoRows[0].nickname,
            'profilePhotoUrl': userInfoRows[0].profilePhotoUrl,
            'jwt': token
        });

    } catch (err) {
        logger.error(`App - postSignIn Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};



//회원 정보 수정
exports.patchUser = async function (userInfo) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction();
        if(!userInfo.bio) {
            //자기소개 없으면 업데이트 안함.
        }else{
            //자기소개 업데이트
            const insertUserResult = await userDao.updateUserBio(connection, userInfo.bio, userInfo.userIdx);
        }

        //프사 수정 여부
        if(!userInfo.profilePhoto){
            //프사 수정 안함
            const UserInfoResult = await userDao.selectUserInfo(connection, userInfo.userIdx);

            await connection.commit();
            return response(baseResponse.UPDATE_USERINFO_SUCCESS,
                Object.assign({'userIdx': userInfo.userIdx}, UserInfoResult[0]));

        }else{
            //프사 수정함
            //프사 업로드
            const uploadProfilePhotoResult = await uploadToFirebaseStorage(connection, userInfo, userInfo.userIdx);
            const UserInfoResult = await userDao.selectUserInfo(connection, userInfo.userIdx);

            await connection.commit();

            return response(baseResponse.UPDATE_USERINFO_SUCCESS,
                Object.assign({'userIdx': userInfo.userIdx}, UserInfoResult[0]));
        }




    } catch (err) {

        await connection.rollback();
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);

    }finally {
        connection.release();
    }
};


//회원 탈퇴
exports.deleteUser = async function (userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction();
        const deleteUserResult = await userDao.updateUserStatus(connection, userIdx, 'DELETED');
        const deleteAccountResult = await userDao.updateAccountStatus(connection, userIdx, 'DELETED');

        connection.commit();
        return response(baseResponse.UPDATE_USERSTATUS_SUCCESS);


    } catch (err) {

        await connection.rollback();
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);

    }finally {
        connection.release();
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



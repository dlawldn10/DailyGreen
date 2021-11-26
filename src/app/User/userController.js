

const userProvider = require("../../app/User/userProvider");
const userService = require("../../app/User/userService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");
const Cache = require('memory-cache');
const regexEmail = require("regex-email");

const request = require("request");

const crypto = require("crypto");

const jwt = require('jsonwebtoken');
const path = require('path');
const AppleAuth = require('apple-auth');
const appleConfig = require('../../../config/apple.json');
// const auth = new AppleAuth(appleConfig, path.join(__dirname, `../../../secretKey/AuthKey_7DQH2L92P5.p8`));



// res.redirect('download?imgName=' + image.originalname);

//카카오 회원가입
exports.postKaKaoUsers = async function (req ,res) {

    //소셜 아이디 회원가입인 경우
    //1. 일단 req.body 데이터를 모두 받고
    //2. 받은 accesstoken을 이용해서 카카오에서 회원 정보 가져오기
    //3. 프사 업로드하고
    //4. 계정 생성


    const userInfo = {
        password: 'tmpPassword',
        phoneNum: '00000000000',
        profilePhoto: req.file,
        nickname: req.body.nickname,
        bio: req.body.bio
    }

    const accessTokenInfo = {
        accessToken : req.body.accessToken
    }


    // 빈 값 체크
    if (!userInfo.nickname)
        return res.send(response(baseResponse.SIGNUP_NICKNAME_EMPTY));
    else if (!userInfo.bio)
        return res.send(response(baseResponse.SIGNUP_BIO_EMPTY));
    else if (!accessTokenInfo.accessToken)
        return res.send(response(baseResponse.SIGNUP_ACCESSTOKEN_EMPTY));
    else if (!userInfo.profilePhoto)
        return res.send(response(baseResponse.SIGNUP_PROFILEPHOTO_EMPTY));




    //카카오 로그인 -> 이메일 가져오기
    request.get({
        url: "https://kapi.kakao.com/v2/user/me",
        headers: {
            Authorization: `Bearer ${accessTokenInfo.accessToken}`
        }
    }, async (err, response, body) => {
        if(err != null){
            return res.send(baseResponse.KAKAO_LOGIN_ERROR, {
                    alert: err
                }
            );

        }else {
            const result = JSON.parse(body);
            const userEmail = {
                email: result.kakao_account.email
            }
            Object.assign(accessTokenInfo, userEmail);
        }
    });


    const signUpResponse = await userService.createUser('kakao', userInfo, accessTokenInfo);
    return res.send(signUpResponse);

};

//애플 회원가입
exports.postAppleUsers = async function (req ,res) {
    try {
    let code = req.body.code;

    if (!code) {
        return res.send(response(baseResponse.SIGNUP_APPLE_ACCESSTOKEN_EMPTY));
    }
    const auth = new AppleAuth(appleConfig, path.join(__dirname, `../../../secretKey/AuthKey_7DQH2L92P5.p8`));
    const TokenResponse = await auth.accessToken(code);
    const idToken = jwt.decode(TokenResponse.id_token);
    // const sub = idToken.sub;


    const userInfo = {
        password: 'tmpPassword',
        phoneNum: '00000000000',
        profilePhoto: req.file,
        nickname: req.body.nickname,
        bio: req.body.bio
    }

    const accessTokenInfo = {
        email: idToken.email
    }


    // 빈 값 체크
    if (!userInfo.nickname)
        return res.send(response(baseResponse.SIGNUP_NICKNAME_EMPTY));
    else if (!userInfo.bio)
        return res.send(response(baseResponse.SIGNUP_BIO_EMPTY));
    else if (!accessTokenInfo.email)
        return res.send(response(baseResponse.FAILED_GETIING_APPLE_EMAIL));
    else if (!userInfo.profilePhoto)
        return res.send(response(baseResponse.SIGNUP_PROFILEPHOTO_EMPTY));



    const signUpResponse = await userService.createUser('apple', userInfo, accessTokenInfo);
    return res.send(signUpResponse);

    } catch (ex) {
        console.error(ex);
        res.send(baseResponse.APPLE_AUTH_ERROR);
    }

};

//닉네임 중복 체크
exports.postNicknameCheck = async function (req, res) {

    const nickname = req.body.nickname;

    // 빈 값 체크
    if (!nickname)
        return res.send(response(baseResponse.SIGNUP_NICKNAME_EMPTY));

    // 길이 체크
    if (nickname.length > 8)
        return res.send(response(baseResponse.SIGNUP_NICKNAME_LENGTH));

    const nicknameCheckResponse = await userProvider.nicknameCheck(nickname);

    return res.send(nicknameCheckResponse);
};


//전화번호 인증번호 발급
exports.postPhoneNumberCheck = async function (req, res){

    const user_phone_number = req.body.phoneNumber;
    Cache.del(user_phone_number);

    let resultResponse = response(baseResponse.SEND_SMS_SUCCESS);
    const date = Date.now().toString();
    const uri = "ncp:sms:kr:260204349130:daily_green"; //서비스 ID
    const secretKey = "BoRsQ6PIsPHm7FPGXc8ZClVQnVMr7oYVf00IWHmU";// Secret Key
    const accessKey = "KejeShIMS7H75JdOFn5R";//Access Key
    const method = "POST";
    const space = " ";
    const newLine = "\n";
    const url = `https://sens.apigw.ntruss.com/sms/v2/services/${uri}/messages`;
    const url2 = `/sms/v2/services/${uri}/messages`;
    const message = [];
    const hmac = crypto.createHmac('sha256', secretKey);
    message.push(method);
    message.push(space);
    message.push(url2);
    message.push(newLine);
    message.push(date);
    message.push(newLine);
    message.push(accessKey);

    //message 배열에 위의 내용들을 담아준 후에
    const signature = hmac.update(message.join('')).digest('base64');
    //message.join('') 으로 만들어진 string 을 hmac 에 담고, base64로 인코딩한다

    //인증번호 발급
    let verifyCode = "";
    for (let i = 0; i < 6; i++) {
        verifyCode += parseInt(Math.random() * 10);
    }


    request(
        {
            method: method,
            json: true,
            uri: url,
            headers: {
                "Content-type": "application/json; charset=utf-8",
                "x-ncp-iam-access-key": accessKey,
                "x-ncp-apigw-timestamp": date,
                "x-ncp-apigw-signature-v2": signature.toString()},
            body: {
                type: 'SMS',
                countryCode: '82',
                from: '01055605449',
                content: `일상그린 인증번호: ${verifyCode}`,
                messages: [{ to: `${user_phone_number}` }]} },
        async (err, response, body) => {
            if(err != null){
                //전송 실패
                console.log(err);
                // console.log(res);
                resultResponse = response(baseResponse.PHONE_NUMBER_SMS_ERROR);
            }
            else {
                //전송 성공
                Cache.put(user_phone_number, verifyCode);
                console.log(body);
                // console.log(res);
            }
        }

    );

    return res.send(resultResponse);
}

//인증번호 확인
exports.postPhoneNumberVerify = async function (req, res){

    const phoneNumber = req.body.phoneNumber
    const verifyCode = req.body.verifyCode;

    const CacheData = Cache.get(phoneNumber);
    if (!CacheData) {
        return res.send(response(baseResponse.NO_VERIFY_REQUEST));
    }

    if (CacheData !== verifyCode) {
        return res.send(response(baseResponse.VERIFY_CODE_WRONG));
    }

    Cache.del(phoneNumber);

    return res.send(response(baseResponse.VERIFY_PHONENUMBER_SUCCESS));
}

//카카오 로그인
exports.kakaoLogin = async function (req, res) {

    const accessTokenInfo = {
        accessToken : req.body.accessToken
    }

    // 빈 값 체크
    if (!accessTokenInfo.accessToken)
        return res.send(response(baseResponse.SIGNUP_ACCESSTOKEN_EMPTY));

    //카카오 로그인 -> 이메일 가져오기
    request.get({
        url: "https://kapi.kakao.com/v2/user/me",
        headers: {
            Authorization: `Bearer ${accessTokenInfo.accessToken}`
        }
    }, async (err, response, body) => {
        if(err != null){
            return res.send(baseResponse.KAKAO_LOGIN_ERROR, {
                    alert: err
                }
            );

        }else{

            const result = JSON.parse(body);
            const userEmail = {
                email: result.kakao_account.email
            }
            Object.assign(accessTokenInfo, userEmail);
            const logInResponse = await userService.postKakaoSignIn(accessTokenInfo);
            return res.send(logInResponse);

        }

    });


};

//애플 로그인
exports.appleLogin = async function (req, res) {


    let code = req.body.code;

    if (!code) {
        return res.send(response(baseResponse.SIGNUP_APPLE_ACCESSTOKEN_EMPTY));
    }

    const auth = new AppleAuth(appleConfig, path.join(__dirname, `../../../secretKey/AuthKey_7DQH2L92P5.p8`));
    const TokenResponse = await auth.accessToken(code);
    const idToken = jwt.decode(TokenResponse.id_token);

    const accessTokenInfo = {
        email: idToken.email,
        accessToken : code
    }



    const signUpResponse = await userService.postAppleSignIn(accessTokenInfo);
    return res.send(signUpResponse);


};


//홈화면 - 이벤트 배너
exports.getEvents = async function (req, res) {

    const userIdxFromJWT = req.verifiedToken.userIdx;

    // 빈 값 체크
    if (!userIdxFromJWT)
        return res.send(response(baseResponse.TOKEN_EMPTY));

    const retrieveEventsResponse = await userProvider.retrieveEvents(userIdxFromJWT);
    return res.send(response(baseResponse.SUCCESS, retrieveEventsResponse));


};


//회원 탈퇴
exports.patchUserStatus = async function (req, res) {

    const userIdxFromJWT = req.verifiedToken.userIdx;
    const userIdx = req.params.userIdx;

    // 빈 값 체크
    if (!userIdxFromJWT)
        return res.send(response(baseResponse.TOKEN_EMPTY));
    else if (!userIdx)
        return res.send(response(baseResponse.USERIDX_EMPTY));

    const deleteUserResult = await userService.deleteUser(userIdx);
    return res.send(deleteUserResult);


};




//자체 회원가입
exports.postOriginUser = async function (req ,res) {

    //자체 회원가입인 경우
    //-> 별도 서비스 함수 만드는게 나을 듯 함.
    //이메일, 비밀번호, 전화번호 추가. accesstoken 없음.

    const userInfo = {
        password: req.body.password,
        phoneNum: req.body.phoneNum,
        profilePhoto: req.file,
        nickname: req.body.nickname,
        bio: req.body.bio
    }

    const accessTokenInfo = {
        email: req.body.email
    }


    // 빈 값 체크
    if (!accessTokenInfo.email)
        return res.send(response(baseResponse.SIGNUP_EMAIL_EMPTY));
    else if (!userInfo.password)
        return res.send(response(baseResponse.SIGNUP_PASSWORD_EMPTY));
    else if (!userInfo.phoneNum)
        return res.send(response(baseResponse.SIGNUP_PHONENUM_EMPTY));
    else if (!userInfo.profilePhoto)
        return res.send(response(baseResponse.SIGNUP_PROFILEPHOTO_EMPTY));
    else if (!userInfo.nickname)
        return res.send(response(baseResponse.SIGNUP_NICKNAME_EMPTY));
    else if (!userInfo.bio)
        return res.send(response(baseResponse.SIGNUP_BIO_EMPTY));


    // 이메일 형식 체크 (by 정규표현식)
    if (!regexEmail.test(accessTokenInfo.email))
        return res.send(response(baseResponse.SIGNUP_EMAIL_TYPE_ERROR));

    // 전화번호 형식(길이) 체크
    if (userInfo.phoneNum.length > 11 || /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}/.test(userInfo.phoneNum))
        return res.send(response(baseResponse.SIGNUP_PHONENUM_TYPE_ERROR));


    const signUpResponse = await userService.createUser('origin', userInfo, accessTokenInfo);
    return res.send(signUpResponse);




};


//자체 로그인
exports.originLogin = async function (req, res) {

    const userInfo = {
        email: req.body.email,
        password: req.body.password
    }

    // 빈 값 체크
    if (!userInfo.password)
        return res.send(response(baseResponse.SIGNUP_PASSWORD_EMPTY));
    else if (!userInfo.email)
        return res.send(response(baseResponse.SIGNUP_EMAIL_EMPTY));


    // 이메일 형식 체크 (by 정규표현식)
    if (!regexEmail.test(userInfo.email))
        return res.send(response(baseResponse.SIGNUP_EMAIL_TYPE_ERROR));


    const logInResponse = await userService.postOriginSignIn(userInfo);
    return res.send(logInResponse);


};



//마이페이지
exports.getMyPage = async function (req, res) {

    const userIdxFromJWT = req.verifiedToken.userIdx;
    const targetUserIdx = req.params.userIdx;

    // 빈 값 체크
    if (!userIdxFromJWT)
        return res.send(response(baseResponse.TOKEN_EMPTY));
    else if (!targetUserIdx)
        return res.send(response(baseResponse.USERIDX_EMPTY));

    const retrieveEventsResponse = await userProvider.retrieveMyPage(targetUserIdx);
    return res.send(response(baseResponse.SUCCESS, retrieveEventsResponse));


};


//회원정보 수정
exports.patchUserProfile = async function (req ,res) {


    const userInfo = {
        userIdx: req.verifiedToken.userIdx,
        profilePhoto: req.file,
        bio: req.body.bio
    }



    const signUpResponse = await userService.patchUser(userInfo);
    return res.send(signUpResponse);




};





/** JWT 토큰 검증 API
 * [GET] /app/auto-login
 */
exports.check = async function (req, res) {
    const userIdxResult = req.verifiedToken.userIdx;
    console.log(userIdxResult);
    return res.send(response(baseResponse.TOKEN_VERIFICATION_SUCCESS));
};












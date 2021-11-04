
const jwtMiddleware = require("../../../config/jwtMiddleware");
const userProvider = require("../../app/User/userProvider");
const userService = require("../../app/User/userService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const regexEmail = require("regex-email");
const jquery = require("jquery");
const {emit} = require("nodemon");


const admin = require('firebase-admin');
const multer = require('multer');
const stream = require('stream');
const serviceAccount = require('../../../dailygreen-6e49d-firebase-adminsdk-8g5gf-6d834b83b1.json');
const request = require("request");

const firebaseAdmin = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'dailygreen-6e49d.appspot.com'
});


// exports.imageTestPost = async function (req, res) {
//
//     console.log(req.body.test);
//     var image = req.file;
//     var bufferStream = new stream.PassThrough();
//     bufferStream.end(new Buffer.from(image.buffer, 'ascii'));
//     var fileName = image.originalname;
//     let file = firebaseAdmin.storage().bucket().file(fileName);
//     bufferStream.pipe(file.createWriteStream({
//         metadata:{ contentType: image.mimetype }
//     })).on('error', (eer) => {
//         console.log(eer);
//     }).on('finish', () => {
//         console.log(fileName + " finish");
//         res.redirect('download?imgName=' + image.originalname);
//     });
//
// }
//
// exports.imageTestGet = async function (req, res) {
//     var imgName = req.query.imgName;
//     var file = firebaseAdmin.storage().bucket().file(imgName);
//     const config = { action: "read", expires: '03-17-2030' };
//     file.getSignedUrl(config,
//         (err, url) => {
//             if (err) {
//                 console.log(err);
//             }
//             console.log(url);
//             return res.send(response(baseResponse.SUCCESS));
//         });
//
// }

//카카오 회원가입
exports.postKaKaoUsers = async function (req ,res) {

    //소셜 아이디 회원가입인 경우
    //1. 일단 req.body 데이터를 모두 받고
    //2. 받은 accesstoken을 이용해서 카카오에서 회원 정보 가져오기
    //3. 프사 업로드하고
    //4. 계정 생성

    //자체 회원가입인 경우
    //-> 별도 서비스 함수 만드는게 나을 듯 함.
    //이메일, 비밀번호, 전화번호 추가. accesstoken 없음.

    const userInfo = {
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


    //프사 설정
    if (!userInfo.profilePhoto){
        //기본 프사로 설정하겠다.
        userInfo.profilePhoto = '기본 프사 url';

        const signUpResponse = await userService.createUser('kakao', userInfo, accessTokenInfo);
        return res.send(signUpResponse);

    }else{
        //새로운 프사로 설정한다.

        //사진 업로드
        const bufferStream = new stream.PassThrough();
        bufferStream.end(new Buffer.from(userInfo.profilePhoto.buffer, 'ascii'));
        const fileName = Date.now();
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
                    // console.log(url);
                    userInfo.profilePhoto = url;
                    const signUpResponse = await userService.createUser('kakao', userInfo, accessTokenInfo);
                    return res.send(signUpResponse);
                });
        });


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


//홈화면 - 이벤트 배너
exports.getEvents = async function (req, res) {

    const userIdxFromJWT = req.verifiedToken.userIdx;

    // 빈 값 체크
    if (!userIdxFromJWT)
        return res.send(response(baseResponse.TOKEN_VERIFICATION_FAILURE));

    const retrieveEventsResponse = await userProvider.retrieveEvents(userIdxFromJWT);
    return res.send(retrieveEventsResponse);


};








/** JWT 토큰 검증 API
 * [GET] /app/auto-login
 */
exports.check = async function (req, res) {
    const userIdxResult = req.verifiedToken.userIdx;
    console.log(userIdxResult);
    return res.send(response(baseResponse.TOKEN_VERIFICATION_SUCCESS));
};












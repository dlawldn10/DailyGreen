
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


exports.imageTestPost = async function (req, res) {

    console.log(req.body.test);
    var image = req.file;
    var bufferStream = new stream.PassThrough();
    bufferStream.end(new Buffer.from(image.buffer, 'ascii'));
    var fileName = image.originalname;
    let file = firebaseAdmin.storage().bucket().file(fileName);
    bufferStream.pipe(file.createWriteStream({
        metadata:{ contentType: image.mimetype }
    })).on('error', (eer) => {
        console.log(eer);
    }).on('finish', () => {
        console.log(fileName + " finish");
        res.redirect('download?imgName=' + image.originalname);
    });

}

exports.imageTestGet = async function (req, res) {
    var imgName = req.query.imgName;
    var file = firebaseAdmin.storage().bucket().file(imgName);
    const config = { action: "read", expires: '03-17-2030' };
    file.getSignedUrl(config,
        (err, url) => {
            if (err) {
                console.log(err);
            }
            console.log(url);
            return res.send(response(baseResponse.SUCCESS));
        });

}

/**
 * API No. 1
 * API Name : 유저 생성 (회원가입) API
 * [POST] /app/users
 */
exports.postUsers = async function (req ,res) {


    //소셜 아이디 회원가입인 경우
    //새 유저, 액세스, 계정 토큰 생성
    //1. 일단 먼저 유저를 생성하고
    //2. 유저 인덱스가 생성되면 accesstoken 저장
    //3. 토큰 인덱스 생성되면
    //지금은 생략 (4. 저장한 엑세스 토큰으로 사용자의 이메일, 비밀번호, 프사 등 정보 가져와서)
    //5. 계정 생성

    //자체 로그인인 경우
    //새 유저, 계정만 생성

    //sort를 보고 판단한다.
    //1. 'apple', 'kakao', 'naver' 인 경우는 소셜 회원가입.
    //2. 'origin'인 경우 자체 회원가입

    const signUpSort = req.body.sort;

    if(signUpSort == 'origin'){

        return res.send(response(baseResponse.SIGNUP_ORIGIN_NOT_SUPPORTED));

    }else if(signUpSort == 'kakao' || signUpSort == 'apple' || signUpSort == 'naver') {
        //소셜 회원가입
        const userInfo = {
            profilePhoto: req.file,
            nickname: req.body.nickname,
            bio: req.body.bio
        }

        const accessTokenInfo = {
            accessToken : req.body.accessToken,
            sort: signUpSort
        }


        // 빈 값 체크
        if (!accessTokenInfo.accessToken)
            return res.send(response(baseResponse.SIGNUP_ACCESSTOKEN_EMPTY));
        else if (!userInfo.nickname)
            return res.send(response(baseResponse.SIGNUP_NICKNAME_EMPTY));
        else if (!userInfo.bio)
            return res.send(response(baseResponse.SIGNUP_BIO_EMPTY));
        else if (!signUpSort)
            return res.send(response(baseResponse.SIGNUP_SORT_EMPTY));

        if(signUpSort == 'kakao'){
            //카카오 로그인 -> 이메일 가져오기
            request.get({
                url: "https://kapi.kakao.com/v2/user/me",
                headers: {
                    Authorization: `Bearer ${accessTokenInfo.accessToken}`
                }
            }, async (err, response, body) => {
                const result = JSON.parse(body);
                const userEmail = {
                    email: result.kakao_account.email
                }
                // return res.send(result.kakao_account.email);
                Object.assign(accessTokenInfo, userEmail);
                // console.log(accessTokenInfo);
                // return res.send(accessTokenInfo);
            });

        }else if(signUpSort == 'apple'){
            //애플 로그인
            const userEmail = {
                email: "tmp@icloud.com"
            }
            Object.assign(accessTokenInfo, userEmail);

        }else if(signUpSort == 'naver'){
            //네이버 로그인
            const userEmail = {
                email: "tmp@naver.com"
            }
            Object.assign(accessTokenInfo, userEmail);
        }


        //프사 설정
        if (!userInfo.profilePhoto){
            //기본 프사로 설정하겠다.
            userInfo.profilePhoto = '기본 프사 url';

            const signUpResponse = await userService.createUser(userInfo, accessTokenInfo);
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
                        const signUpResponse = await userService.createUser(userInfo, accessTokenInfo);
                        return res.send(signUpResponse);
                    });
            });


        }

    }else{
        return res.send(response(baseResponse.SIGNUP_SORT_WRONG));
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


/**
 * API No. 2
 * API Name : 로그인 API
 * [POST] /app/login
 * body : email, passsword
 */
exports.login = async function (req, res) {

    const {accountName, password} = req.body;

    // 빈 값 체크
    if (!accountName)
        return res.send(response(baseResponse.LOGIN_ACCOUNTNAME_EMPTY));
    else if(!password)
        return res.send(response(baseResponse.LOGIN_PASSWORD_EMPTY));


    const logInResponse = await userService.postSignIn(accountName, password);

    return res.send(logInResponse);
};



/** JWT 토큰 검증 API
 * [GET] /app/auto-login
 */
exports.check = async function (req, res) {
    const userIdxResult = req.verifiedToken.userIdx;
    console.log(userIdxResult);
    return res.send(response(baseResponse.TOKEN_VERIFICATION_SUCCESS));
};


//계정 프로필 조회
exports.getAccountProfile = async function (req, res) {

    const accountIdx = req.params.accountIdx;

    // 빈 값 체크
    if (!accountIdx)
        return res.send(response(baseResponse.ACCOUNTIDX_EMPTY));


    const retrieveAccountProfileResult = await userProvider.retrieveAccountProfile(accountIdx);

    return res.send(response(baseResponse.SUCCESS, retrieveAccountProfileResult[0]));
};


//계정 프로필 수정
exports.patchAccountProfile = async function (req, res) {

    const accountIdx = req.params.accountIdx;
    const reqBody = {
        profilePhotoUrl: req.body.profilePhotoUrl,
        name: req.body.name,
        accountName: req.body.accountName,
        bio: req.body.bio
    };


    // 빈 값 체크
    if (!accountIdx)
        return res.send(response(baseResponse.ACCOUNTIDX_EMPTY));
    if (!reqBody.profilePhotoUrl)
        return res.send(response(baseResponse.PROFILEPHOTO_EMPTY));
    if (!reqBody.name)
        return res.send(response(baseResponse.NAME_EMPTY));
    if (!reqBody.accountName)
        return res.send(response(baseResponse.ACCOUNTNAME_EMPTY));
    if (!reqBody.bio)
        return res.send(response(baseResponse.BIO_EMPTY));


    const updateAccountProfileResult = await userService.updateAccountProfile(accountIdx, reqBody);

    return res.send(response(baseResponse.SUCCESS, updateAccountProfileResult[0]));
};


//계정 추가
exports.postNewAccount = async function (req, res) {

    const reqBody = {
        userIdx: req.body.userIdx,
        accountName: req.body.accountName,
        password: req.body.password,
        name: req.body.name
    };


    // 빈 값 체크
    if (!reqBody.userIdx)
        return res.send(response(baseResponse.USERIDX_EMPTY));
    if (!reqBody.accountName)
        return res.send(response(baseResponse.ACCOUNTNAME_EMPTY));
    if (!reqBody.password)
        return res.send(response(baseResponse.SIGNUP_PASSWORD_EMPTY));
    if (!reqBody.name)
        return res.send(response(baseResponse.SIGNUP_NAME_EMPTY));


    const postNewAccountResult = await userService.postNewAccountInfo(reqBody);

    return res.send(postNewAccountResult);
};










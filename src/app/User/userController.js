
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

const firebaseAdmin = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'dailygreen-6e49d.appspot.com'
});


exports.imageTestPost = async function (req, res) {

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
exports.postUsers = async function (req, res) {

    /**
     * Body: fbAccessToken, accountName, password, name
     */
    const {fbAccessToken, accountName, password, name} = req.body;

    // 빈 값 체크
    if (!fbAccessToken)
        return res.send(response(baseResponse.SIGNUP_ACCESSTOKEN_EMPTY));
    else if(!accountName)
        return res.send(response(baseResponse.SIGNUP_ACCOUNTNAME_EMPTY));
    else if(!password)
        return res.send(response(baseResponse.SIGNUP_PASSWORD_EMPTY));
    else if(!name)
        return res.send(response(baseResponse.SIGNUP_NAME_EMPTY));

    // 길이 체크
    if (accountName.length > 30)
        return res.send(response(baseResponse.SIGNUP_ACCOUNTNAME_LENGTH));


    const signUpResponse = await userService.createUser(
        fbAccessToken, accountName, password, name
    );

    return res.send(signUpResponse);
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










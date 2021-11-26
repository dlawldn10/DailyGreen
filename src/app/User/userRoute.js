const user = require("./userController");
const jwtMiddleware = require("../../../config/jwtMiddleware");


module.exports = function(app){
    const user = require('./userController');
    const multer = require("multer");
    const upload = multer({ storage: multer.memoryStorage() });
    const jwtMiddleware = require('../../../config/jwtMiddleware');


    //회원 가입 전 닉네임 중복 검사
    app.post('/app/users/nicknames', upload.none(), user.postNicknameCheck);



    //전화번호 인증번호 발급
    app.post('/app/users/auth', upload.none(), user.postPhoneNumberCheck);
    //전화번호 인증번호 비교
    app.post('/app/users/auth/verify', upload.none(), user.postPhoneNumberVerify);


    //회원가입을 나누자

    // 1. 카카오 로그인 시도 후
    app.post('/app/login/kakao', upload.none(), user.kakaoLogin);
    // 2. 존재하지 않는 계정이면 카카오 계정으로 회원가입
    app.post('/app/users/kakao', upload.single('profilePhoto'), user.postKaKaoUsers);

    //자체 회원가입
    app.post('/app/users', upload.single('profilePhoto'), user.postOriginUser);

    //자체 로그인
    app.post('/app/login', upload.none(), user.originLogin);

    //애플 회원가입
    app.post('/app/users/apple', upload.single('profilePhoto'), user.postAppleUsers);

    //애플 로그인
    app.post('/app/login/apple', upload.none(), user.appleLogin);



    //홈화면 - 이벤트 배너
    app.get('/app/users/events', jwtMiddleware, upload.none(), user.getEvents);



    //마이페이지
    app.get('/app/users/:userIdx', jwtMiddleware, upload.none(), user.getMyPage);

    //회원정보 수정
    app.patch('/app/users', jwtMiddleware, upload.single('profilePhoto'), user.patchUserProfile);

    //회원탈퇴
    app.patch('/app/users/:userIdx', jwtMiddleware, upload.none(), user.patchUserStatus);



};



module.exports = function(app){
    const user = require('./userController');
    const multer = require("multer");
    const upload = multer({ storage: multer.memoryStorage() });



    //회원 가입 전 닉네임 중복 검사
    app.post('/app/users/nicknames', user.postNicknameCheck);

    //자체 회원가입
    //전화번호 인증번호 발급
    app.post('/app/users/auth', user.postPhoneNumberCheck);
    //전화번호 인증번호 비교
    app.post('/app/users/auth/verify', user.postPhoneNumberVerify);


    //회원가입을 나누자

    // 1. 카카오 로그인 시도 후
    app.post('/app/login/kakao', user.kakaoLogin);
    // 2. 존재하지 않는 계정이면 카카오 계정으로 회원가입
    app.post('/app/users/kakao', upload.single('profilePhoto'), user.postKaKaoUsers);


    // //홈화면 - 이벤트 배너
    // app.get('/app/users/events', user.getEvents);



};

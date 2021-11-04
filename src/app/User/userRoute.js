const user = require("./userController");
const jwtMiddleware = require("../../../config/jwtMiddleware");


module.exports = function(app){
    const user = require('./userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    const multer = require("multer");
    const upload = multer({ storage: multer.memoryStorage() });


    // app.post('/app/upload/photo', upload.single('photo'), user.imageTestPost);
    // app.get('/app/upload/download', user.imageTestGet);



    //회원 가입 전 닉네임 중복 검사
    app.post('/app/users/nicknames', user.postNicknameCheck);

    //회원가입을 나누자

    // 1. 카카오 로그인 시도 후
    app.post('/app/login/kakao', user.kakaoLogin);
    // 2. 존재하지 않는 계정이면 카카오 계정으로 회원가입
    app.post('/app/users/kakao', upload.single('profilePhoto'), user.postKaKaoUsers);


    // //홈화면 - 이벤트 배너
    // app.get('/app/users/events', user.getEvents);



};

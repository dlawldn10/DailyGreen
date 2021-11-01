const user = require("./userController");
const jwtMiddleware = require("../../../config/jwtMiddleware");


module.exports = function(app){
    const user = require('./userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    const multer = require("multer");


    var upload = multer({ storage: multer.memoryStorage() });
    // 이미지 업로드 테스트
    app.post('/app/upload/photo', upload.single('photo'), user.imageTestPost);
    app.get('/app/upload/download', user.imageTestGet);




    // 유저 생성 (회원가입) API
    app.post('/app/users', user.postUsers);

    // 로그인 하기 API (JWT 생성)
    app.post('/app/login', user.login);


    //계정 추가
    app.post('/app/users/accounts', jwtMiddleware, user.postNewAccount);


    //내 프로필 조회
    app.get('/app/accounts/:accountIdx/profiles', jwtMiddleware, user.getAccountProfile);

    //내 프로필 수정
    app.patch('/app/accounts/:accountIdx/profiles', jwtMiddleware, user.patchAccountProfile);



};

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

    // 유저 생성 (회원가입) API
    app.post('/app/users', upload.single('profilePhoto'), user.postUsers);




    // 로그인 하기 API (JWT 생성)
    app.post('/app/login', user.login);





};

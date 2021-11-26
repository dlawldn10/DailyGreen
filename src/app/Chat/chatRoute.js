const chat = require("./chatController");
const jwtMiddleware = require("../../../config/jwtMiddleware");

module.exports = function(app) {
    const chat = require('./chatController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    const multer = require("multer");
    const upload = multer({storage: multer.memoryStorage()});


    //쪽지 보내기
    app.post('/app/chats', jwtMiddleware, upload.none(), chat.postChat);

    //특정 상대방과의 대화 기록 받아오기
    app.get('/app/users/:userIdx/chats', jwtMiddleware, upload.none(), chat.getChatHistory);

    //대화방 목록 받아오기
    app.get('/app/chats', jwtMiddleware, upload.none(), chat.getChatRooms);

}
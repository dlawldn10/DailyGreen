module.exports = {

    // Success
    SUCCESS : { "isSuccess": true, "code": 1000, "message":"성공" },

    // Common
    TOKEN_EMPTY : { "isSuccess": false, "code": 2000, "message":"JWT 토큰을 입력해주세요." },
    TOKEN_VERIFICATION_FAILURE : { "isSuccess": false, "code": 3000, "message":"JWT 토큰 검증 실패" },
    TOKEN_VERIFICATION_SUCCESS : { "isSuccess": true, "code": 1001, "message":"JWT 토큰 검증 성공" },
    ACCOUNTIDX_NOT_MATCH : { "isSuccess": false, "code": 3009, "message":"해당 유저가 아닙니다" },


    //Request error
    SIGNUP_ACCESSTOKEN_EMPTY : { "isSuccess": false, "code": 2001, "message":"액세스 토큰을 입력해주세요" },
    SIGNUP_ACCOUNTNAME_EMPTY : { "isSuccess": false, "code": 2002, "message":"계정명을 입력해주세요" },
    SIGNUP_PASSWORD_EMPTY : { "isSuccess": false, "code": 2003, "message":"비밀번호를 입력해주세요" },
    SIGNUP_NAME_EMPTY : { "isSuccess": false, "code": 2004, "message":"이름을 입력해주세요" },

    SIGNUP_REDUNDANT_ACCOUNTNAME : { "isSuccess": false, "code": 2005, "message":"중복된 계정명입니다." },
    SIGNUP_ACCOUNTNAME_LENGTH : { "isSuccess": false, "code": 2006, "message":"계정명은 30자리 미만으로 입력해주세요" },

    LOGIN_ACCOUNTNAME_EMPTY : { "isSuccess": false, "code": 2007, "message": "계정명(id)을 입력해주세요." },
    LOGIN_PASSWORD_EMPTY : { "isSuccess": false, "code": 2008, "message": "비밀번호를 입력해주세요." },

    ACCOUNTIDX_EMPTY : { "isSuccess": false, "code": 2009, "message": "accountIdx를 인식할 수 없습니다." },
    STORYIDX_EMPTY : { "isSuccess": false, "code": 2010, "message": "storyIdx를 인식할 수 없습니다." },
    POSTIDX_EMPTY : { "isSuccess": false, "code": 2011, "message": "postIdx를 인식할 수 없습니다." },
    POST_PHOTOLIST_EMPTY : { "isSuccess": false, "code": 2012, "message": "postPhotoList를 인식할 수 없습니다." },
    COMMENTIDX_EMPTY : { "isSuccess": false, "code": 2013, "message": "commentIdx를 인식할 수 없습니다." },
    FROM_ACCOUNTIDX_EMPTY : { "isSuccess": false, "code": 2016, "message": "fromAccountIdx를 인식할 수 없습니다." },
    TO_ACCOUNTIDX_EMPTY : { "isSuccess": false, "code": 2017, "message": "toAccountIdx를 인식할 수 없습니다." },

    PROFILEPHOTO_EMPTY : { "isSuccess": false, "code": 2018, "message": "profilePhotoUrl를 인식할 수 없습니다." },
    NAME_EMPTY : { "isSuccess": false, "code": 2019, "message": "name을 인식할 수 없습니다." },
    ACCOUNTNAME_EMPTY : { "isSuccess": false, "code": 2020, "message": "accountName을 인식할 수 없습니다." },
    BIO_EMPTY : { "isSuccess": false, "code": 2021, "message": "bio를 인식할 수 없습니다." },
    USERIDX_EMPTY : { "isSuccess": false, "code": 2022, "message": "userIdx를 인식할 수 없습니다." },
    ACTION_EMPTY : { "isSuccess": false, "code": 2024, "message": "action을 입력해 주세요." },
    ACTION_WRONG : { "isSuccess": false, "code": 2025, "message": "action을 바르게 입력해 주세요." },

    PAGECOUNT_WRONG : { "isSuccess": false, "code": 2014, "message": "잘못된 페이지 호출입니다." },

    COMMENT_CONTENT_EMPTY : { "isSuccess": false, "code": 2015, "message": "댓글 내용을 입력해주세요." },


    // Response error
    SIGNIN_ACCOUNTNAME_WRONG : { "isSuccess": false, "code": 3003, "message": "계정명(id)가 잘못 되었습니다." },
    SIGNIN_PASSWORD_WRONG : { "isSuccess": false, "code": 3004, "message": "비밀번호가 잘못 되었습니다." },
    SIGNIN_INACTIVE_ACCOUNT : { "isSuccess": false, "code": 3005, "message": "비활성화 된 계정입니다. 고객센터에 문의해주세요." },
    SIGNIN_WITHDRAWAL_ACCOUNT : { "isSuccess": false, "code": 3006, "message": "탈퇴 된 계정입니다. 고객센터에 문의해주세요." },

    //Connection, Transaction 등의 서버 오류
    DB_ERROR : { "isSuccess": false, "code": 4000, "message": "데이터 베이스 에러"},
    SERVER_ERROR : { "isSuccess": false, "code": 4001, "message": "서버 에러"},


}

module.exports = {

    // Success
    SUCCESS : { "isSuccess": true, "code": 1000, "message":"성공" },

    // Common
    TOKEN_EMPTY : { "isSuccess": false, "code": 2000, "message":"JWT 토큰을 입력해주세요." },
    TOKEN_VERIFICATION_FAILURE : { "isSuccess": false, "code": 3000, "message":"JWT 토큰 검증 실패" },
    TOKEN_VERIFICATION_SUCCESS : { "isSuccess": true, "code": 1001, "message":"JWT 토큰 검증 성공" },
    NICKNAME_VERIFICATION_SUCCESS : { "isSuccess": true, "code": 1002, "message":"사용 가능한 닉네임입니다." },
    COMMUNITY_FOLLOW_SUCCESS : { "isSuccess": true, "code": 1003, "message":"해당 커뮤니티에 성공적으로 참여하였습니다." },
    COMMUNITY_UNFOLLOW_SUCCESS : { "isSuccess": true, "code": 1004, "message":"해당 커뮤니티 참여를 취소하였습니다." },
    CREATE_CLUB_SUCCESS : { "isSuccess": true, "code": 1005, "message":"모임이 생성되었습니다." },


    //Request error
    SIGNUP_APPLE_ACCESSTOKEN_EMPTY : { "isSuccess": false, "code": 2001, "message":"애플 액세스 토큰을(를) 입력해주세요" },
    SIGNUP_KAKAO_ACCESSTOKEN_EMPTY : { "isSuccess": false, "code": 2002, "message":"카카오 액세스 토큰을(를) 입력해주세요" },
    SIGNUP_NAVER_ACCESSTOKEN_EMPTY : { "isSuccess": false, "code": 2003, "message":"네이버 액세스 토큰을(를) 입력해주세요" },

    SIGNUP_PROFILEPHOTO_EMPTY : { "isSuccess": false, "code": 2004, "message":"프로필 사진을(를) 등록해주세요" },
    SIGNUP_NICKNAME_EMPTY : { "isSuccess": false, "code": 2005, "message":"닉네임을(를) 등록해주세요" },
    SIGNUP_BIO_EMPTY : { "isSuccess": false, "code": 2006, "message":"자기소개를(를) 등록해주세요" },

    SIGNUP_REDUNDANT_NICKNAME : { "isSuccess": false, "code": 2007, "message":"중복된 닉네임입니다." },
    SIGNUP_NICKNAME_LENGTH : { "isSuccess": false, "code": 2008, "message":"닉네임은 9자리 미만으로 입력해주세요." },
    SIGNUP_ACCESSTOKEN_EMPTY : { "isSuccess": false, "code": 2009, "message":"액세스 토큰을(를) 입력해주세요" },
    SIGNUP_REDUNDANT_ACCESSTOKEN : { "isSuccess": false, "code": 2010, "message":"이미 가입된 회원입니다." },
    SIGNUP_SORT_EMPTY : { "isSuccess": false, "code": 2011, "message":"로그인 종류를 입력하세요." },
    SIGNUP_SORT_WRONG : { "isSuccess": false, "code": 2012, "message":"로그인 종류가 올바르지 않습니다." },

    SIGNUP_ORIGIN_NOT_SUPPORTED : { "isSuccess": false, "code": 2013, "message":"현재는 지원하지 않는 기능입니다. 소셜 회원가입을 진행해주세요." },



    ACCOUNTIDX_EMPTY : { "isSuccess": false, "code": 2014, "message": "accountIdx을(를) 입력해주세요." },
    USERIDX_EMPTY : { "isSuccess": false, "code": 2015, "message": "userIdx을(를) 입력해주세요." },
    COMMUNITYIDX_EMPTY : { "isSuccess": false, "code": 2016, "message": "communityIdx을(를) 입력해주세요." },
    CLUBNAME_EMPTY : { "isSuccess": false, "code": 2017, "message": "clubName을(를) 입력해주세요." },
    CLUBPHOTOURLLIST_EMPTY : { "isSuccess": false, "code": 2018, "message": "clubPhotoUrlList을(를) 입력해주세요." },
    TAGLIST_EMPTY : { "isSuccess": false, "code": 2019, "message": "tagList을(를) 입력해주세요." },
    BIO_EMPTY : { "isSuccess": false, "code": 2020, "message": "bio을(를) 입력해주세요." },
    MAXPEOPLENUM_EMPTY : { "isSuccess": false, "code": 2021, "message": "maxPeopleNum을(를) 입력해주세요." },
    FEETYPE_EMPTY : { "isSuccess": false, "code": 2022, "message": "feeType을(를) 입력해주세요." },
    FEE_EMPTY : { "isSuccess": false, "code": 2023, "message": "fee을(를) 입력해주세요." },
    KAKAOCAHTLINK_EMPTY : { "isSuccess": false, "code": 2024, "message": "kakaoChatLink을(를) 입력해주세요." },
    ISREGULAR_EMPTY : { "isSuccess": false, "code": 2025, "message": "isRegular을(를) 입력해주세요." },
    LOCATIONIDX_EMPTY : { "isSuccess": false, "code": 2026, "message": "locationIdx을(를) 입력해주세요." },
    LOCATIONDETAIL_EMPTY : { "isSuccess": false, "code": 2027, "message": "locationDetail을(를) 입력해주세요." },
    WHEN_EMPTY : { "isSuccess": false, "code": 2028, "message": "when을(를) 입력해주세요." },




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
    ACCOUNT_NOT_EXIST : { "isSuccess": false, "code": 3007, "message": "존재하지 않는 계정입니다. 회원가입을 진행해 주세요." },
    ACCOUNT_ALREADY_EXIST : { "isSuccess": false, "code": 3009, "message": "이미 존재하는 계정입니다. 로그인을 진행해주세요." },
    KAKAO_LOGIN_ERROR : { "isSuccess": false, "code": 3008, "message": "카카오 액세스 에러" },
    COMMUNITY_FOLLOW_ERROR : { "isSuccess": false, "code": 3010, "message": "이미 해당 커뮤니티에 참여하고 있습니다." },
    COMMUNITY_UNFOLLOW_ERROR : { "isSuccess": false, "code": 3011, "message": "이미 해당 커뮤니티에 참여하고 있지 않습니다." },

    //Connection, Transaction 등의 서버 오류
    DB_ERROR : { "isSuccess": false, "code": 4000, "message": "데이터 베이스 에러"},
    SERVER_ERROR : { "isSuccess": false, "code": 4001, "message": "서버 에러"},


}

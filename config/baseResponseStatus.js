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
    CREATE_WORKSHOP_SUCCESS : { "isSuccess": true, "code": 1006, "message":"워크샵이 생성되었습니다." },
    VERIFY_PHONENUMBER_SUCCESS : { "isSuccess": true, "code": 1007, "message":"휴대전화 인증 성공." },
    SEND_SMS_SUCCESS : { "isSuccess": true, "code": 1008, "message":"SMS 문자 전송 성공." },
    UPDATE_CLUB_SUCCESS : { "isSuccess": true, "code": 1009, "message":"모임 수정 성공." },
    UPDATE_WORKSHOP_SUCCESS : { "isSuccess": true, "code": 1010, "message":"워크샵 수정 성공." },
    CREATE_FEED_SUCCESS : { "isSuccess": true, "code": 1011, "message":"게시물 생성 성공." },
    UPDATE_FEED_SUCCESS : { "isSuccess": true, "code": 1012, "message":"게시물 수정 성공." },
    INSERT_POSTLIKE_SUCCESS : { "isSuccess": true, "code": 1013, "message":"좋아요가 추가되었습니다." },
    CANCEL_POSTLIKE_SUCCESS : { "isSuccess": true, "code": 1014, "message":"좋아요가 취소되었습니다." },
    REINSERT_POSTLIKE_SUCCESS : { "isSuccess": true, "code": 1015, "message":"좋아요가 다시 추가되었습니다." },
    INSERT_COMMENT_SUCCESS : { "isSuccess": true, "code": 1016, "message":"댓글이 추가되었습니다." },


    //Request error
    SIGNUP_APPLE_ACCESSTOKEN_EMPTY : { "isSuccess": false, "code": 2001, "message":"애플 액세스 토큰을(를) 입력해주세요" },
    SIGNUP_KAKAO_ACCESSTOKEN_EMPTY : { "isSuccess": false, "code": 2002, "message":"카카오 액세스 토큰을(를) 입력해주세요" },
    SIGNUP_NAVER_ACCESSTOKEN_EMPTY : { "isSuccess": false, "code": 2003, "message":"네이버 액세스 토큰을(를) 입력해주세요" },

    SIGNUP_PROFILEPHOTO_EMPTY : { "isSuccess": false, "code": 2004, "message":"프로필 사진을(를) 등록해주세요" },
    SIGNUP_NICKNAME_EMPTY : { "isSuccess": false, "code": 2005, "message":"닉네임을(를) 등록해주세요" },
    SIGNUP_BIO_EMPTY : { "isSuccess": false, "code": 2006, "message":"자기소개을(를) 등록해주세요" },

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
    CLUBNAME_EMPTY : { "isSuccess": false, "code": 2017, "message": "모임 name을(를) 입력해주세요." },
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
    CLUBIDX_EMPTY : { "isSuccess": false, "code": 2029, "message": "clubIdx을(를) 입력해주세요." },
    WORKSHOPIDX_EMPTY : { "isSuccess": false, "code": 2030, "message": "workshopIdx을(를) 입력해주세요." },

    POSTIDX_EMPTY : { "isSuccess": false, "code": 2031, "message": "postIdx를 인식할 수 없습니다." },
    POST_PHOTOLIST_EMPTY : { "isSuccess": false, "code": 2032, "message": "postPhotoList를 인식할 수 없습니다." },
    COMMENTIDX_EMPTY : { "isSuccess": false, "code": 2033, "message": "commentIdx를 인식할 수 없습니다." },
    FROM_ACCOUNTIDX_EMPTY : { "isSuccess": false, "code": 2034, "message": "fromAccountIdx를 인식할 수 없습니다." },
    TO_ACCOUNTIDX_EMPTY : { "isSuccess": false, "code": 2035, "message": "toAccountIdx를 인식할 수 없습니다." },

    PAGECOUNT_WRONG : { "isSuccess": false, "code": 2036, "message": "잘못된 페이지 호출입니다." },
    NO_VERIFY_REQUEST : { "isSuccess": false, "code": 2037, "message": "인증 요청 내역이 없습니다. 인증번호를 다시 요청해주세요." },
    VERIFY_CODE_WRONG : { "isSuccess": false, "code": 2038, "message": "인증번호가 일치하지 않습니다." },

    TOO_MUCH_PHOTOS : { "isSuccess": false, "code": 2039, "message": "사진의 갯수가 너무 많습니다. 비정기적 모임은 최대 1장, 정기적 모임은 최대 5장입니다." },
    FEED_TOO_MUCH_PHOTOS : { "isSuccess": false, "code": 2040, "message": "사진의 갯수가 너무 많습니다. 한 피드에 게시할 수 있는 사진은 최대 5장입니다." },

    SIGNUP_EMAIL_EMPTY : { "isSuccess": false, "code": 2041, "message":"이메일을(를) 입력해주세요." },
    SIGNUP_PASSWORD_EMPTY : { "isSuccess": false, "code": 2042, "message":"비밀번호을(를) 입력해주세요." },
    SIGNUP_PHONENUM_EMPTY : { "isSuccess": false, "code": 2043, "message":"전화번호을(를) 입력해주세요." },
    SIGNUP_EMAIL_TYPE_ERROR : { "isSuccess": false, "code": 2044, "message":"이메일 형식이 올바르지 않습니다." },
    SIGNUP_PHONENUM_TYPE_ERROR : { "isSuccess": false, "code": 2045, "message":"전화번호 형식이 올바르지 않습니다. '-' 없이 입력해주세요." },
    COMMENT_CONTENT_EMPTY: { "isSuccess": false, "code": 2046, "message":"댓글 내용을 입력해주세요." },


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
    PHONE_NUMBER_SMS_ERROR : { "isSuccess": false, "code": 3012, "message": "SMS 문자 전송에 실패하였습니다." },

    //Connection, Transaction 등의 서버 오류
    DB_ERROR : { "isSuccess": false, "code": 4000, "message": "데이터 베이스 에러"},
    SERVER_ERROR : { "isSuccess": false, "code": 4001, "message": "서버 에러"},
    FIREBASE_ERROR : { "isSuccess": false, "code": 4002, "message": "파이어베이스 업로드 에러"},


}

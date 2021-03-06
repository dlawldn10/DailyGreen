const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const clubProvider = require("./clubProvider");
const clubDao = require("./clubDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const stream = require("stream");
const admin = require("firebase-admin");
const serviceAccount = require('../../../secretKey/dailygreen-6e49d-firebase-adminsdk-8g5gf-6d834b83b1.json');
let firebaseAdmin = admin;
if (!admin.apps.length) {
    firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'dailygreen-6e49d.appspot.com'
    });
}

//모임 추가
exports.createClub = async function (userIdxFromJWT, clubInfo) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction();

        let resultResponse = response(baseResponse.CREATE_CLUB_SUCCESS);

        //모임 정보 넣기
        const insertClubInfoParams = [
            clubInfo.communityIdx, userIdxFromJWT, clubInfo.clubName, clubInfo.bio,
            clubInfo.maxPeopleNum, clubInfo.when, clubInfo.locationIdx,
            clubInfo.locationDetail, clubInfo.kakaoChatLink, clubInfo.isRegular]
        const insertClubInfoRow = await clubDao.insertClubInfo(connection, insertClubInfoParams);


        const clubIdx = insertClubInfoRow.insertId;
        //모임 회비 정보 넣기
        const insertClubFeeInfoRow = await clubDao.insertClubFeeInfo(connection, clubIdx, clubInfo.fee, clubInfo.feeType);

        if(clubInfo.clubPhotoList.length === 0){
            //기본 이미지 삽입
            const defaultUrl = 'https://firebasestorage.googleapis.com/v0/b/dailygreen-6e49d.appspot.com/o/Clubs%2FClubImages%2Fdummyimg_if_no_img_on_m.jpg?alt=media&token=c2894173-0832-4126-b212-79fb935478b5';
            const insertClubPhotoResult = await clubDao.insertClubPhotoUrl(connection, clubIdx, userIdxFromJWT, defaultUrl);
        }else{
            //사진 게시
            resultResponse = await uploadToFirebaseStorage(connection, resultResponse, clubInfo, userIdxFromJWT, clubIdx);
        }

        if (clubInfo.isRegular == 0) {
            //비정기 모임일때 -> 태그 없음, 사진 한장
            //태그 게시 없이 바로 리턴

            await connection.commit();
            await connection.release();

            return resultResponse;
        }


        //태그들 게시
        for (let i = 0; i < clubInfo.tagList.length; i++) {

            //이 태그가 원래 있던 태그인지 확인
            const selectTagResult = await clubDao.selectTagByTagName(connection, clubInfo.tagList[i]);
            if(selectTagResult[0].Cnt > 0){
                //같은게 있으면 추가 안하고-> pass
                //모임 태그에 등록한다.
                const insertClubTagResult = await clubDao.insertClubTags(connection, selectTagResult[0].tagIdx, clubIdx);

            }else {
                //없으면 추가
                const insertTagResult = await clubDao.insertHashTag(connection, clubInfo.tagList[i]);
                //모임 태그에 등록한다.
                const insertClubTagResult = await clubDao.insertClubTags(connection, insertTagResult.insertId, clubIdx);
            }


        }


        await connection.commit();
        return resultResponse;

    }catch (err) {
        connection.rollback();
        logger.error(`App - createClub Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }finally {
        await connection.release();
    }



}

//모임 수정
exports.updateClub = async function (userIdxFromJWT, clubInfo) {

    const connection = await pool.getConnection(async (conn) => conn);

    let resultResponse = response(baseResponse.UPDATE_CLUB_SUCCESS);
    try {
        await connection.beginTransaction();

        //모임 정보 업데이트
        const updateClubInfoParams = [
            clubInfo.communityIdx, userIdxFromJWT, clubInfo.clubName, clubInfo.bio,
            clubInfo.maxPeopleNum, clubInfo.when, clubInfo.locationIdx,
            clubInfo.locationDetail, clubInfo.kakaoChatLink, clubInfo.isRegular, clubInfo.clubIdx]
        const updateClubInfoRow = await clubDao.updateClubInfo(connection, updateClubInfoParams);

        //모임 회비 정보 업데이트
        const insertClubFeeInfoRow = await clubDao.updateClubFeeInfo(connection, clubInfo.clubIdx, clubInfo.fee, clubInfo.feeType);

        //원래 있던 모임 태그들을 전체 DELETE 하고
        const updateTagResult = await clubDao.updateClubTags(connection, 'DELETED', clubInfo.clubIdx);

        //태그들 업데이트
        for (let i = 0; i < clubInfo.tagList.length; i++) {

            //이 태그가 원래 있던 태그인지 확인
            const selectTagResult = await clubDao.selectTagByTagName(connection, clubInfo.tagList[i]);
            if(selectTagResult[0].Cnt > 0){
                //있었음 -> 신규 등록 pass

                //모임에 원래 붙어있었던 태그인지 확인
                const selectClubTagResult = await clubDao.selectClubTagBytagIdx(connection, clubInfo.clubIdx, selectTagResult[0].tagIdx);
                if(selectClubTagResult[0].Cnt > 0){
                    //있었음 -> status update
                    const updateTagResult = await clubDao.updateOneClubTag(connection, 'ACTIVE', clubInfo.clubIdx, selectTagResult[0].tagIdx);

                }else{
                    //없었음 -> 새로 삽입.
                    const insertTagResult = await clubDao.insertClubTags(connection, selectTagResult[0].tagIdx, clubInfo.clubIdx);
                }

            }else {
                //없었음 -> 신규등록
                const insertTagResult = await clubDao.insertHashTag(connection, clubInfo.tagList[i]);

                //신규태그일 것이므로 모임 태그에 바로 등록한다.
                const insertClubTagResult = await clubDao.insertClubTags(connection, insertTagResult.insertId, clubInfo.clubIdx);
            }

        }




        await connection.commit();
        return resultResponse;


    }catch (err) {

        connection.rollback();
        logger.error(`App - updateClub Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);

    }finally {

        await connection.release();

    }
}


//파이어베이스 업로드
async function uploadToFirebaseStorage(connection, resultResponse, clubInfo, userIdxFromJWT, clubIdx) {
    //사진 업로드
    for (let i = 0; i < clubInfo.clubPhotoList.length; i++) {

        //사진 업로드
        const bufferStream = new stream.PassThrough();
        bufferStream.end(new Buffer.from(clubInfo.clubPhotoList[i].buffer, 'ascii'));
        const fileName = Date.now() + `_${clubIdx}` + `_${i + 1}`;

        const file = firebaseAdmin.storage().bucket().file('Clubs/ClubImages/' + fileName);

        await bufferStream.pipe(file.createWriteStream({
            metadata: {contentType: clubInfo.clubPhotoList[i].mimetype}
        })).on('error', (eer) => {
            console.log(eer);
            connection.rollback();
            resultResponse = errResponse(baseResponse.FIREBASE_ERROR);
            return resultResponse;
        });

        const config = {action: "read", expires: '03-17-2030'};
        const url = await file.getSignedUrl(config);
        console.log(url);
        const insertClubPhotoUrlRow = await clubDao.insertClubPhotoUrl(connection, clubIdx, userIdxFromJWT, url);

    }

    return resultResponse;
}



async function pushToList(postPhotoUrlList, url){
    postPhotoUrlList.push(url);
    return postPhotoUrlList;
}


//모임 참가/취소
exports.createClubFollowing = async function (userIdx, clubIdx) {

    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction();
        const CheckParticipantCnt = await clubDao.selectIfFull(connection, clubIdx);
        const LikeStatus = await clubDao.selectIfClubFollowExist(connection, userIdx, clubIdx);

        console.log(CheckParticipantCnt[0], LikeStatus.length);

        //기록이 존재하지 않을때
        if(LikeStatus.length <= 0){

            if(CheckParticipantCnt[0].available === 1) {
                //참가 추가
                const insertPostLikeResult = await clubDao.insertClubFollowInfo(connection, userIdx, clubIdx);
                await connection.commit();
                return response(baseResponse.INSERT_CLUBFOLLOWING_SUCCESS);
            }else if(CheckParticipantCnt[0].available === 0){
                //인원 초과로 참가 불가능
                return response(baseResponse.TOOMUCH_PARTICIPANTS_ERROR);
            }

        }else{
            //참가했던 기록이 있을 때

            if((CheckParticipantCnt[0].available === 0 || CheckParticipantCnt[0].available === 1) && LikeStatus[0].status === 'ACTIVE' ){
                //참가 취소
                const updatePostLikeResult = await clubDao.updateClubFollowInfo(connection, userIdx, clubIdx, 'DELETED');
                await connection.commit();
                return response(baseResponse.CANCEL_CLUBFOLLOWING_SUCCESS);
            }else if(CheckParticipantCnt[0].available === 1 && LikeStatus[0].status === 'DELETED'){
                //다시 참가 추가
                const updatePostLikeResult = await clubDao.updateClubFollowInfo(connection, userIdx, clubIdx, 'ACTIVE');
                await connection.commit();
                return response(baseResponse.REINSERT_CLUBFOLLOWING_SUCCESS);
            }else {
                //참가 추가 불가
                return response(baseResponse.TOOMUCH_PARTICIPANTS_ERROR);
            }

        }

    }catch (err) {

        connection.rollback();
        logger.error(`App - createClubFollowing Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);

    }finally {

        await connection.release();

    }
}


//모임 삭제
exports.deleteClub = async function (userIdx, clubIdx) {

    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction();


        const deleteClubInfoResult = await clubDao.deleteClubInfo(connection, clubIdx);
        const deleteClubPhotoUrlsResult = await clubDao.deleteClubPhotoUrls(connection, clubIdx);
        const clubTypeResult = await clubDao.selectClubType(connection, clubIdx);

        if(clubTypeResult[0].isRegular == 0){
            await connection.commit();
            return response(baseResponse.DELETE_CLUB_SUCCESS);
        }

        const deleteClubTagsResult = await clubDao.deleteClubTags(connection, clubIdx);
        await connection.commit();
        return response(baseResponse.DELETE_CLUB_SUCCESS);

    }catch (err) {

        connection.rollback();
        logger.error(`App - deleteClub Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);

    }finally {

        await connection.release();

    }
}
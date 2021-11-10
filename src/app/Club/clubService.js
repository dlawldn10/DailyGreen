const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const clubProvider = require("./clubProvider");
const clubDao = require("./clubDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");
const stream = require("stream");
const admin = require("firebase-admin");
const serviceAccount = require("../../../dailygreen-6e49d-firebase-adminsdk-8g5gf-6d834b83b1.json");
let firebaseAdmin = admin;
console.log(admin.apps.length);
if (!admin.apps.length) {
    firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'dailygreen-6e49d.appspot.com'
    });
}

//모임 추가
exports.createClub = async function (userIdxFromJWT, clubInfo, clubPhotoUrlList) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction();

        //모임 정보 넣기
        const insertClubInfoParams = [
            clubInfo.communityIdx, userIdxFromJWT, clubInfo.clubName, clubInfo.bio,
            clubInfo.maxPeopleNum, clubInfo.when, clubInfo.locationIdx,
            clubInfo.locationDetail, clubInfo.kakaoChatLink, clubInfo.isRegular]
        const insertClubInfoRow = await clubDao.insertClubInfo(connection, insertClubInfoParams);


        //모임 회비 정보 넣기
        const insertClubFeeInfoRow = await clubDao.insertClubFeeInfo(connection, insertClubInfoRow.insertId, clubInfo.fee, clubInfo.feeType);


        if (clubInfo.isRegular == 0) {
            //비정기 모임일때 -> 태그 없음, 사진 한장

            const insertClubPhotoUrlRow = await clubDao.insertClubPhotoUrl(connection, insertClubInfoRow.insertId, userIdxFromJWT, clubPhotoUrlList[0]);

            await connection.commit();
            connection.release();

            return response(baseResponse.CREATE_CLUB_SUCCESS);
        }

        //사진들 넣기
        for (let i = 0; i < clubPhotoUrlList.length; i++) {
            const insertClubPhotoUrlRow = await clubDao.insertClubPhotoUrl(connection, insertClubInfoRow.insertId, userIdxFromJWT, clubPhotoUrlList[i]);
        }

        //태그들 게시
        for (let i = 0; i < clubInfo.tagList.length; i++) {


            const insertTagResult = await clubDao.insertHashTag(connection, clubInfo.tagList[i]);
            const selectTagResult = await clubDao.selectTagByTagName(connection, clubInfo.tagList[i]);
            const insertStoryTagResult = await clubDao.insertClubHashTags(connection, selectTagResult[0].tagIdx, insertClubInfoRow.insertId);

        }


        await connection.commit();
        connection.release();

        return response(baseResponse.CREATE_CLUB_SUCCESS);

    }catch (err) {
        logger.error(`App - createClub Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
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

            //태그를 삽입한다. 이때 이미 있던 태그들은 무시된다.
            const insertTagResult = await clubDao.insertHashTag(connection, clubInfo.tagList[i]);

            //새로 삽입하거나 업데이트한 태그의 tagIdx를 구한다.
            const selectTagResult = await clubDao.selectTagByTagName(connection, clubInfo.tagList[i]);
            console.log(selectTagResult[0].tagIdx);

            //모임 태그에 등록한다.
            //전에 있던 태그인지 여부를 확인하고
            const selectClubTagResult = await clubDao.selectClubTagBytagIdx(connection, clubInfo.clubIdx, selectTagResult[0].tagIdx);
            console.log(selectClubTagResult[0].Cnt);
            // 수정 전에 있던 태그가 있으면 status update
            if(selectClubTagResult[0].Cnt > 0){
                const updateTagResult = await clubDao.updateOneClubTag(connection, 'ACTIVE', clubInfo.clubIdx, selectTagResult[0].tagIdx);

            }else{
                //없으면 새로 삽입.
                const insertTagResult = await clubDao.insertClubTags(connection, selectTagResult[0].tagIdx, clubInfo.clubIdx);
            }

        }


        //사진 수정...흠

        if(clubInfo.clubPhotoList.length > 0){

            resultResponse = await uploadToFirebaseStorage(connection, resultResponse, clubInfo, userIdxFromJWT);
        }

        connection.commit();
        return resultResponse;


    }catch (err) {

        connection.rollback();
        logger.error(`App - updateClub Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);

    }finally {

        connection.release();

    }
}

async function uploadToFirebaseStorage(connection, resultResponse, clubInfo, userIdxFromJWT) {
    //사진 업로드
    const clubPhotoUrlList = [];
    for (let i = 0; i < clubInfo.clubPhotoList.length; i++) {

        const bufferStream = new stream.PassThrough();
        bufferStream.end(new Buffer.from(clubInfo.clubPhotoList[i].buffer, 'ascii'));
        const fileName = Date.now() + `_${clubInfo.clubIdx}` + `_${i + 1}`;

        const file = firebaseAdmin.storage().bucket().file('Clubs/ClubImages/' + fileName);

        await bufferStream.pipe(file.createWriteStream({

            metadata: {contentType: clubInfo.clubPhotoList[i].mimetype}

        })).on('error', (eer) => {

            console.log(eer);

        }).on('finish', () => {

            console.log(fileName + " finish");
            //업로드한 사진 url다운
            const config = {action: "read", expires: '03-17-2030'};
            file.getSignedUrl(config,
                async (err, url) => {
                    if (err) {
                        console.log(err);
                        connection.rollback();
                        resultResponse = errResponse(baseResponse.FIREBASE_ERROR);
                        return resultResponse;
                    }

                    clubPhotoUrlList.push(url);

                    if (clubPhotoUrlList.length == clubInfo.clubPhotoList.length) {
                        //타이밍 맞추기 위한 if문.
                        delete clubInfo.clubPhotoList;
                        if (clubInfo.isRegular === 0) {
                            //비정기 모임일때 -> 사진 한장
                            const insertClubPhotoUrlRow = await clubDao.insertClubPhotoUrl(connection, clubInfo.clubIdx, userIdxFromJWT, clubPhotoUrlList[0]);

                        }

                        //사진들 넣기
                        for (let i = 0; i < clubPhotoUrlList.length; i++) {
                            const insertClubPhotoUrlRow = await clubDao.insertClubPhotoUrl(connection, clubInfo.clubIdx, userIdxFromJWT, clubPhotoUrlList[i]);
                        }

                    }
                });
        });
    }

    return resultResponse;
}



const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const workshopProvider = require("./workshopProvider");
const workshopDao = require("./workshopDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");
const admin = require("firebase-admin");
const serviceAccount = require("../../../dailygreen-6e49d-firebase-adminsdk-8g5gf-6d834b83b1.json");
const stream = require("stream");

let firebaseAdmin = admin;
if (!admin.apps.length) {
    firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'dailygreen-6e49d.appspot.com'
    });
}

//워크샵 추가
exports.createWorkshop = async function (userIdxFromJWT, workshopInfo) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {

        await connection.beginTransaction();

        let resultResponse = response(baseResponse.CREATE_WORKSHOP_SUCCESS);


        //워크샵 정보 넣기
        const insertWorkshopInfoParams = [
            workshopInfo.communityIdx, userIdxFromJWT, workshopInfo.workshopName, workshopInfo.bio,
            workshopInfo.maxPeopleNum, workshopInfo.when, workshopInfo.locationIdx,
            workshopInfo.locationDetail, workshopInfo.kakaoChatLink]
        const insertWorkshopInfoRow = await workshopDao.insertWorkshopInfo(connection, insertWorkshopInfoParams);

        const workshopIdx = insertWorkshopInfoRow.insertId;

        //워크샵 회비 정보 넣기
        const insertWorkshopFeeInfoRow = await workshopDao.insertWorkshopFeeInfo(connection, workshopIdx, workshopInfo.fee, workshopInfo.feeType);

        if(workshopInfo.clubPhotoList.length === 0){
            //기본 이미지 삽입
            const defaultUrl = 'https://firebasestorage.googleapis.com/v0/b/dailygreen-6e49d.appspot.com/o/Clubs%2FClubImages%2Fdummyimg_if_no_img_on_m.jpg?alt=media&token=c2894173-0832-4126-b212-79fb935478b5';
            const insertWorkshopPhotoUrlRow = await workshopDao.insertWorkshopPhotoUrl(connection, workshopIdx, userIdxFromJWT, defaultUrl);
        }else{
            //워크샵 사진 넣기
            const insertWorkshopPhotoUrlRow = await uploadToFirebaseStorage(connection, resultResponse, workshopInfo, userIdxFromJWT, workshopIdx);

        }


        //태그들 게시
        for (let i = 0; i < workshopInfo.tagList.length; i++) {

            //전체 태그테이블은 수정(삭제)하지 않는걸로..
            //이 태그가 원래 있던 태그인지 확인
            const selectTagResult = await workshopDao.selectTagByTagName(connection, workshopInfo.tagList[i]);
            if(selectTagResult[0].Cnt > 0){
                //같은게 있으면 추가 안하고-> pass
                //워크샵 태그에 등록
                const insertWorkshopTagResult = await workshopDao.insertWorkshopTags(connection, selectTagResult[0].tagIdx, workshopIdx);

            }else {
                //없으면 추가
                const insertTagResult = await workshopDao.insertHashTag(connection, workshopInfo.tagList[i]);
                //워크샵 태그에 등록
                const insertWorkshopTagResult = await workshopDao.insertWorkshopTags(connection, insertTagResult.insertId, workshopIdx);
            }

        }

        await connection.commit();
        return resultResponse;

    }catch (err) {
        logger.error(`App - createWorkshop Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }finally {
        connection.release();
    }



}

//워크샵 수정
exports.updateWorkshop = async function (userIdxFromJWT, workshopInfo) {

    const connection = await pool.getConnection(async (conn) => conn);

    let resultResponse = response(baseResponse.UPDATE_WORKSHOP_SUCCESS);
    try {
        await connection.beginTransaction();

        //모임 정보 업데이트
        const updateWorkshopInfoParams = [
            workshopInfo.communityIdx, userIdxFromJWT, workshopInfo.workshopName, workshopInfo.bio,
            workshopInfo.maxPeopleNum, workshopInfo.when, workshopInfo.locationIdx,
            workshopInfo.locationDetail, workshopInfo.kakaoChatLink, workshopInfo.workshopIdx]
        const updateClubInfoRow = await workshopDao.updateWorkshopInfo(connection, updateWorkshopInfoParams);

        //모임 회비 정보 업데이트
        const insertClubFeeInfoRow = await workshopDao.updateWorkshopFeeInfo(connection, workshopInfo.workshopIdx, workshopInfo.fee, workshopInfo.feeType);

        //원래 있던 모임 태그들을 전체 DELETE 하고
        const updateTagResult = await workshopDao.updateWorkshopTags(connection, 'DELETED', workshopInfo.workshopIdx);

        //태그들 업데이트
        for (let i = 0; i < workshopInfo.tagList.length; i++) {

            //이 태그가 원래 있던 태그인지 확인
            const selectTagResult = await workshopDao.selectTagByTagName(connection, workshopInfo.tagList[i]);
            if(selectTagResult[0].Cnt > 0){
                //있었음 -> 신규 등록 pass

                //모임에 원래 붙어있었던 태그인지 확인
                const selectClubTagResult = await workshopDao.selectWorkshopTagBytagIdx(connection, workshopInfo.workshopIdx, selectTagResult[0].tagIdx);
                if(selectClubTagResult[0].Cnt > 0){
                    //있었음 -> status update
                    const updateTagResult = await workshopDao.updateOneWorkshopTag(connection, 'ACTIVE', workshopInfo.workshopIdx, selectTagResult[0].tagIdx);

                }else{
                    //없었음 -> 새로 삽입.
                    const insertTagResult = await workshopDao.insertWorkshopTags(connection, selectTagResult[0].tagIdx, workshopInfo.workshopIdx);
                }

            }else {
                //없었음 -> 신규등록
                const insertTagResult = await workshopDao.insertHashTag(connection, workshopInfo.tagList[i]);

                //신규태그일 것이므로 모임 태그에 바로 등록한다.
                const insertClubTagResult = await workshopDao.insertWorkshopTags(connection, insertTagResult.insertId, workshopInfo.workshopIdx);
            }

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



//파이어베이스 업로드
async function uploadToFirebaseStorage(connection, resultResponse, workshopInfo, userIdxFromJWT, workshopIdx) {
    //사진 업로드
    const workshopPhotoUrlList = [];
    for (let i = 0; i < workshopInfo.workshopPhotoList.length; i++) {

        const bufferStream = new stream.PassThrough();
        bufferStream.end(new Buffer.from(workshopInfo.workshopPhotoList[i].buffer, 'ascii'));
        const fileName = Date.now() + `_${workshopIdx}` + `_${i + 1}`;

        const file = firebaseAdmin.storage().bucket().file('Workshops/WorkshopImages/' + fileName);

        await bufferStream.pipe(file.createWriteStream({

            metadata: {contentType: workshopInfo.workshopPhotoList[i].mimetype}

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

                    workshopPhotoUrlList.push(url);

                    if (workshopPhotoUrlList.length == workshopInfo.workshopPhotoList.length) {
                        //타이밍 맞추기 위한 if문.
                        delete workshopInfo.workshopPhotoList;

                        //사진들 넣기
                        for (let i = 0; i < workshopPhotoUrlList.length; i++) {
                            const insertWorkshopPhotoUrlRow = await workshopDao.insertWorkshopPhotoUrl(connection, workshopIdx, userIdxFromJWT, workshopPhotoUrlList[i]);
                        }

                    }
                });
        });
    }

    return resultResponse;
}



const workshopProvider = require("../../app/Workshop/workshopProvider");
const workshopService = require("../../app/Workshop/workshopService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");
const admin = require('firebase-admin');
const multer = require('multer');
const stream = require('stream');
const serviceAccount = require('../../../dailygreen-6e49d-firebase-adminsdk-8g5gf-6d834b83b1.json');
const request = require("request");


let firebaseAdmin = admin;
if (!admin.apps.length) {
    firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'dailygreen-6e49d.appspot.com'
    });
}


//워크샵 생성
exports.postWorkshop = async function (req, res) {

    const userIdxFromJWT = req.verifiedToken.userIdx;
    const workshopInfo = {
        communityIdx : req.body.communityIdx,
        workshopName : req.body.name,
        workshopPhotoList : req.files,
        tagList : req.body.tagList,
        bio : req.body.bio,
        maxPeopleNum: req.body.maxPeopleNum,
        feeType : req.body.feeType,
        fee : req.body.fee,
        kakaoChatLink :req.body.kakaoChatLink,
        locationIdx :req.body.locationIdx,
        locationDetail : req.body.locationDetail,
        when : req.body.when
    }


    // 빈 값 체크
    if (!userIdxFromJWT)
        return res.send(response(baseResponse.TOKEN_VERIFICATION_FAILURE));
    else if (!workshopInfo.communityIdx)
        return res.send(response(baseResponse.COMMUNITYIDX_EMPTY));
    else if (!workshopInfo.workshopName)
        return res.send(response(baseResponse.CLUBNAME_EMPTY));
    else if (!workshopInfo.workshopPhotoList)
        return res.send(response(baseResponse.CLUBPHOTOURLLIST_EMPTY));
    else if (!workshopInfo.tagList)
        return res.send(response(baseResponse.TAGLIST_EMPTY));
    else if (!workshopInfo.bio)
        return res.send(response(baseResponse.BIO_EMPTY));
    else if (!workshopInfo.maxPeopleNum)
        return res.send(response(baseResponse.MAXPEOPLENUM_EMPTY));
    else if (!workshopInfo.feeType)
        return res.send(response(baseResponse.FEETYPE_EMPTY));
    else if (!workshopInfo.fee)
        return res.send(response(baseResponse.FEE_EMPTY));
    else if (!workshopInfo.kakaoChatLink)
        return res.send(response(baseResponse.KAKAOCAHTLINK_EMPTY));
    // else if (!workshopInfo.isRegular)
    //     return res.send(response(baseResponse.ISREGULAR_EMPTY));
    else if (!workshopInfo.locationIdx)
        return res.send(response(baseResponse.LOCATIONIDX_EMPTY));
    else if (!workshopInfo.locationDetail)
        return res.send(response(baseResponse.LOCATIONDETAIL_EMPTY));
    else if (!workshopInfo.when)
        return res.send(response(baseResponse.WHEN_EMPTY));


    const workshopPhotoUrlList = [];
    for(let i=0;i<workshopInfo.workshopPhotoList.length;i++) {

        //사진 업로드
        const bufferStream = new stream.PassThrough();
        bufferStream.end(new Buffer.from(workshopInfo.workshopPhotoList[i].buffer, 'ascii'));
        const fileName = Date.now() + `_${i+1}`;

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
                    }
                    // console.log(url);
                    workshopPhotoUrlList.push(url);
                    if(workshopPhotoUrlList.length == workshopInfo.workshopPhotoList.length){
                        //타이밍 맞추기 위한 if문.
                        delete workshopInfo.workshopPhotoList;
                        const createWorkshopPhotosResponse = await workshopService.createWorkshop(userIdxFromJWT, workshopInfo, workshopPhotoUrlList);
                        return res.send(createWorkshopPhotosResponse);
                        // return res.send(response(baseResponse.SUCCESS));
                    }
                });
        });
    }



}


//워크샵탭 조회
exports.getWorkshopList = async function (req, res){

    let page = req.query.page;
    const communityIdx = req.params.communityIdx;
    const userIdxFromJWT = req.verifiedToken.userIdx;

    const limit = 5;

    if (!userIdxFromJWT)
        return res.send(errResponse(baseResponse.TOKEN_EMPTY));
    else if (!communityIdx)
        return res.send(errResponse(baseResponse.COMMUNITYIDX_EMPTY));

    if(limit-page < 0){

        page = 0;

    }else if(page == 0 || !page){

        return res.send(errResponse(baseResponse.PAGECOUNT_WRONG));
    }else{

        page = (page-1)*limit

    }

    const workshopListResult = await workshopProvider.retrieveWorkshopList(userIdxFromJWT, page, limit, communityIdx);
    return res.send(response(baseResponse.SUCCESS, workshopListResult));

}

//워크샵 상세 조회
exports.getWorkshop = async function (req, res){

    const workshopIdx = req.params.workshopIdx;
    const userIdxFromJWT = req.verifiedToken.userIdx;

    if (!userIdxFromJWT)
        return res.send(errResponse(baseResponse.TOKEN_EMPTY));
    else if (!workshopIdx)
        return res.send(errResponse(baseResponse.WORKSHOPIDX_EMPTY));

    const retrieveWorkshopResult = await workshopProvider.retrieveWorkshop(userIdxFromJWT, workshopIdx);
    return res.send(response(baseResponse.SUCCESS, retrieveWorkshopResult));

}

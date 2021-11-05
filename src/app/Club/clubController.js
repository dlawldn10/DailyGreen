const clubProvider = require("../../app/Club/clubProvider");
const clubService = require("../../app/Club/clubService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");
const admin = require('firebase-admin');
const multer = require('multer');
const stream = require('stream');
const serviceAccount = require('../../../dailygreen-6e49d-firebase-adminsdk-8g5gf-6d834b83b1.json');
const request = require("request");
let firebaseAdmin;
if (!admin.apps.length) {
    firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'dailygreen-6e49d.appspot.com'
    });
}


//모임 생성
exports.postClub = async function (req, res) {

    const userIdxFromJWT = req.verifiedToken.userIdx;
    const clubInfo = {
        communityIdx : req.body.communityIdx,
        clubName : req.body.clubName,
        clubPhotoList : req.files,
        tagList : req.body.tagList,
        bio : req.body.bio,
        maxPeopleNum: req.body.maxPeopleNum,
        feeType : req.body.feeType,
        fee : req.body.fee,
        kakaoChatLink :req.body.kakaoChatLink,
        isRegular : req.body.isRegular,
        locationIdx :req.body.locationIdx,
        locationDetail : req.body.locationDetail,
        when : req.body.when
    }


    // 빈 값 체크
    if (!userIdxFromJWT)
        return res.send(response(baseResponse.TOKEN_VERIFICATION_FAILURE));
    else if (!clubInfo.communityIdx)
        return res.send(response(baseResponse.COMMUNITYIDX_EMPTY));
    else if (!clubInfo.clubName)
        return res.send(response(baseResponse.CLUBNAME_EMPTY));
    else if (!clubInfo.clubPhotoList)
        return res.send(response(baseResponse.CLUBPHOTOURLLIST_EMPTY));
    // else if (!clubInfo.tagList)
    //     return res.send(response(baseResponse.TAGLIST_EMPTY));
    else if (!clubInfo.bio)
        return res.send(response(baseResponse.BIO_EMPTY));
    else if (!clubInfo.maxPeopleNum)
        return res.send(response(baseResponse.MAXPEOPLENUM_EMPTY));
    else if (!clubInfo.feeType)
        return res.send(response(baseResponse.FEETYPE_EMPTY));
    else if (!clubInfo.fee)
        return res.send(response(baseResponse.FEE_EMPTY));
    // else if (!clubInfo.kakaoChatLink)
    //     return res.send(response(baseResponse.KAKAOCAHTLINK_EMPTY));
    else if (!clubInfo.isRegular)
        return res.send(response(baseResponse.ISREGULAR_EMPTY));
    else if (!clubInfo.locationIdx)
        return res.send(response(baseResponse.LOCATIONIDX_EMPTY));
    else if (!clubInfo.locationDetail)
        return res.send(response(baseResponse.LOCATIONDETAIL_EMPTY));
    else if (!clubInfo.when)
        return res.send(response(baseResponse.WHEN_EMPTY));


    const clubPhotoUrlList = [];
    for(let i=0;i<clubInfo.clubPhotoList.length;i++) {

        //사진 업로드
        const bufferStream = new stream.PassThrough();
        bufferStream.end(new Buffer.from(clubInfo.clubPhotoList[i].buffer, 'ascii'));
        const fileName = Date.now() + `_${i+1}`;

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
                    }
                    // console.log(url);
                    clubPhotoUrlList.push(url);
                    if(clubPhotoUrlList.length == clubInfo.clubPhotoList.length){
                        //타이밍 맞추기 위한 if문.
                        delete clubInfo.clubPhotoList;
                        const createClubPhotosResponse = await clubService.createClub(userIdxFromJWT, clubInfo, clubPhotoUrlList);
                        return res.send(createClubPhotosResponse);
                        // return res.send(response(baseResponse.SUCCESS));
                    }
                });
        });
    }



}


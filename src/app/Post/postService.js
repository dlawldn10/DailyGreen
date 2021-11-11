const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const postProvider = require("./postProvider");
const postDao = require("./postDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const stream = require("stream");
const admin = require("firebase-admin");
const serviceAccount = require("../../../dailygreen-6e49d-firebase-adminsdk-8g5gf-6d834b83b1.json");
let firebaseAdmin = admin;
if (!admin.apps.length) {
    firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'dailygreen-6e49d.appspot.com'
    });
}

//게시물 올리기
exports.createPost = async function (reqBody, userIdxFromJWT) {
    const connection = await pool.getConnection(async (conn) => conn);
    let resultResponse = response(baseResponse.SUCCESS);

    try {

        connection.beginTransaction();
        const insertPostResult = await postDao.insertNewPost(connection, reqBody);

        //태그 게시
        for(var i =0; i < reqBody.postTagList.length; i++){

            const insertTagResult = await postDao.insertTag(connection, reqBody.postTagList[i]);
            const selectTagResult = await postDao.selectTagByTagName(connection, reqBody.postTagList[i]);

            const selectPostTagResult = await postDao.selectPostTagByTagIdx(connection, insertPostResult[0].insertId, selectTagResult[0].tagIdx);
            console.log(selectPostTagResult[0].Cnt);
            // 수정 전에 있던 태그가 있으면 status update
            if(selectPostTagResult[0].Cnt > 0){
                const updateTagResult = await postDao.updateOnePostTag(connection, 'ACTIVE', insertPostResult[0].insertId, selectTagResult[0].tagIdx);

            }else{
                //없으면 새로 삽입.
                const insertStoryTagResult = await postDao.insertPostTags(connection, selectTagResult[0].tagIdx, insertPostResult[0].insertId);
            }

        }

        //게시물 사진 게시
        if(reqBody.postPhotoList.length > 0) {

            resultResponse = uploadToFirebaseStorage(connection, resultResponse, reqBody, userIdxFromJWT, insertPostResult[0].insertId);
        }

        connection.commit();
        return resultResponse;


    } catch (err) {
        connection.rollback();
        logger.error(`App - createPost Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }finally {
        connection.release();
    }
};


//게시물 수정
exports.updatePost = async function (reqBody) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {

        connection.beginTransaction();
        const updatePostResult = await postDao.updatePost(connection, reqBody);
        connection.commit();


        //원래 있던 PostTags의 태그들을 DELETE 하고
        const updateTagResult = await postDao.updatePostTags(connection, 'DELETED', reqBody.postIdx);
        connection.commit();

        for(let i =0; i < reqBody.postTagList.length; i++){
            connection.beginTransaction();

            //태그를 Tags에 등록한다. 이때 같은 태그가 있으면 무시된다.
            const insertTagResult = await postDao.insertTag(connection, reqBody.postTagList[i]);
            //insert한 태그의 인덱스를 가지고
            const selectTagResult = await postDao.selectTagByTagName(connection, reqBody.postTagList[i]);

            // PostTags에 등록하는데
            const selectPostTagResult = await postDao.selectPostTagByTagIdx(connection, reqBody.postIdx, selectTagResult[0].tagIdx);

            // 수정 전에 있던 태그가 있으면 status update
            if(selectPostTagResult[0].Cnt > 0){
                const updateTagResult = await postDao.updatePostTags(connection, 'ACTIVE', reqBody.postIdx);

            }else{
                const insertStoryTagResult = await postDao.insertPostTags(connection, selectTagResult[0].tagIdx, reqBody.postIdx);
            }

            connection.commit();
        }

        return response(baseResponse.SUCCESS);


    } catch (err) {
        connection.rollback();
        logger.error(`App - updatePost Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }finally {
        connection.release();
    }
};

//게시물 삭제
exports.deletePost = async function (reqBody) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {

        connection.beginTransaction();
        const deletePostResult = await postDao.deletePost(connection, reqBody);
        connection.commit();


        //원래 있던 PostTags의 태그들을 DELETE 하고
        const deleteTagResult = await postDao.updatePostTags(connection, 'DELETED', reqBody.postIdx);
        // 사진, 댓글, 댓글 좋아요, 게시물 좋아요들 모두 삭제
        const deletePhotoUrlResult = await postDao.updatePostPhotoUrl(connection, 'DELETED', reqBody.postIdx);
        const deleteCommentsResult = await postDao.updateComments(connection, 'DELETED', reqBody.postIdx);
        const deleteCommentLikesResult = await postDao.updateCommentLikes(connection, 'DELETED', reqBody.postIdx);
        const deletePostLikesResult = await postDao.updatePostLikes(connection, 'DELETED', reqBody.postIdx);

        connection.commit();



        return response(baseResponse.SUCCESS);


    } catch (err) {
        connection.rollback();
        logger.error(`App - deletePost Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }finally {
        connection.release();
    }
};


async function uploadToFirebaseStorage(connection, resultResponse, reqBody, userIdxFromJWT, postIdx) {
    //사진 업로드
    const postPhotoUrlList = [];
    for (let i = 0; i < reqBody.postPhotoList.length; i++) {

        const bufferStream = new stream.PassThrough();
        bufferStream.end(new Buffer.from(reqBody.postPhotoList[i].buffer, 'ascii'));
        const fileName = Date.now() + `_${postIdx}` + `_${i + 1}`;

        const file = firebaseAdmin.storage().bucket().file('Posts/PostImages/' + fileName);

        await bufferStream.pipe(file.createWriteStream({

            metadata: {contentType: reqBody.postPhotoList[i].mimetype}

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

                    postPhotoUrlList.push(url);

                    if (postPhotoUrlList.length == reqBody.postPhotoList.length) {
                        //타이밍 맞추기 위한 if문.
                        delete reqBody.postPhotoList;

                        //사진들 넣기
                        for (let i = 0; i < postPhotoUrlList.length; i++) {
                            const insertClubPhotoUrlRow = await postDao.insertPostPhotoUrls(connection,
                                postIdx,
                                reqBody.accountIdx,
                                reqBody.postPhotoList[i]);
                        }

                    }
                });
        });
    }

    return resultResponse;
}

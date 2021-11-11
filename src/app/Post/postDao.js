

// 홈화면 포스팅 리스트
async function selectPostFromFollowingUsers(connection, accountIdx, limit, page) {

    const selectPostsQuery = `
    SELECT A.accountIdx,
           A.accountName,
           A.profilePhotoUrl,
           P.postIdx,
           P.caption,
           CASE
             WHEN TIMESTAMPDIFF(MINUTE, P.updatedAt, NOW()) <= 0 THEN '방금 전'
             WHEN TIMESTAMPDIFF(MINUTE, P.updatedAt, NOW()) < 60
               THEN CONCAT(TIMESTAMPDIFF(MINUTE, P.updatedAt, NOW()), '분 전')
             WHEN TIMESTAMPDIFF(HOUR, P.updatedAt, NOW()) < 24
               THEN CONCAT(TIMESTAMPDIFF(HOUR, P.updatedAt, NOW()), '시간 전')
             WHEN TIMESTAMPDIFF(DAY, P.updatedAt, NOW()) < 30 THEN CONCAT(TIMESTAMPDIFF(DAY, P.updatedAt, NOW()), '일 전')
             ELSE CONCAT(TIMESTAMPDIFF(MONTH, P.updatedAt, NOW()), '달 전')
             END AS agoTime
    FROM Posts P
           LEFT JOIN (SELECT \`from\`, \`to\` FROM Follows) AS F ON F.to = P.accountIdx
           LEFT JOIN (SELECT accountIdx, accountName, profilePhotoUrl FROM Accounts) A ON A.accountIdx = P.accountIdx
    WHERE F.\`from\` = ? AND P.status = 'ACTIVE'
    ORDER BY P.updatedAt DESC LIMIT ? OFFSET ?;
    `;

    const selectUserAccountRow = await connection.query(
        selectPostsQuery,
        [accountIdx, limit, page]
    );


    let postList = [];
    for(let i = 0; i<selectUserAccountRow[0].length; i++){
        // postIdxList.push(selectUserAccountRow[0][i].postIdx);
        const photoUrlListResult = await selectPostPhotoUrls(connection, accountIdx, selectUserAccountRow[0][i].postIdx);
        const tagListResult = await selectPostTags(connection, accountIdx, selectUserAccountRow[0][i].postIdx);
        const commentPreviewListResult = await selectCommentPreviews(connection, accountIdx, selectUserAccountRow[0][i].postIdx);
        const postLikeListResult = await selectPostLikes(connection, accountIdx, selectUserAccountRow[0][i].postIdx);
        const postTotalLikeResult = await selectAllPostLikes(connection,selectUserAccountRow[0][i].postIdx);
        const postTotalCommentResult = await selectAllCommentsCount(connection,selectUserAccountRow[0][i].postIdx);

        const postPhotoUrlListObj = {
            postIdx : selectUserAccountRow[0][i].postIdx,
            urlList: photoUrlListResult
        }

        let tagListObj = {};
        if(tagListResult[0] != null) {
            tagListObj = {
                postIdx: selectUserAccountRow[0][i].postIdx,
                tagList: tagListResult
            }
        }

        let commentListObj = {};
        if(commentPreviewListResult[0] != null){
            commentListObj = {
                postIdx : selectUserAccountRow[0][i].postIdx,
                commentList: commentPreviewListResult
            }
        }


        const Result ={
            postList: Object.assign({},
                selectUserAccountRow[0][i],
                postLikeListResult[0],
                postTotalLikeResult[0],
                postTotalCommentResult[0]
            ),
            postPhotoUrlListObj: postPhotoUrlListObj,
            postTagList: tagListObj,
            commentPreview: commentListObj,

        }


        postList.push(Result);
    }


    return postList;
};

// 홈화면 포스팅 사진 리스트
async function selectPostPhotoUrls(connection, accountIdx, postIdxList) {
    const selectPostsQuery = `
    SELECT PPU.url
    FROM PostPhotoUrls PPU
    WHERE PPU.postIdx = ? AND PPU.status = 'ACTIVE';
  `;

    const selectUserAccountRow = await connection.query(
        selectPostsQuery,
        postIdxList
    );

    return selectUserAccountRow[0];
};

// 홈화면 포스팅 댓글 미리보기 리스트
async function selectCommentPreviews(connection, accountIdx, postIdxList) {
    const selectPostsQuery = `
    SELECT *
    FROM (
           SELECT C.commentIdx,
                  C.accountIdx,
                  C.content,
                  C.updatedAt,
                  A.accountName,
                  A.profilePhotoUrl,
                  IF(CL.commentIdx is null, false, true) as isLiked,
                  ROW_NUMBER() OVER (PARTITION BY P.postIdx ORDER BY C.updatedAt DESC) AS RN
           FROM Posts P
                  LEFT JOIN (SELECT \`from\`, \`to\` FROM Follows) AS F ON F.to = P.accountIdx
                  LEFT JOIN (SELECT status, commentIdx, accountIdx, postIdx, content, updatedAt FROM Comments) C
                            ON P.postIdx = C.postIdx
                  LEFT JOIN (SELECT accountIdx, accountName, profilePhotoUrl FROM Accounts) A
                            ON A.accountIdx = C.accountIdx
                  LEFT OUTER JOIN (SELECT commentIdx FROM CommentLikes) CL
                                  ON CL.commentIdx = C.commentIdx
           WHERE F.\`from\` = ? AND P.postIdx = ? AND C.status = 'ACTIVE'
           ORDER BY P.postIdx
         ) as PFCA
    WHERE PFCA.RN <= 2;


  `;

    const selectUserAccountRow = await connection.query(
        selectPostsQuery,
        [accountIdx, postIdxList]
    );


    return selectUserAccountRow[0];
};

// 홈화면 포스팅 태그 리스트
async function selectPostTags(connection, accountIdx, postIdxList) {
    const selectPostsQuery = `
    SELECT PT.tagIdx, T.tagName
    FROM Posts P
           LEFT JOIN (SELECT \`from\`, \`to\` FROM Follows) AS F ON F.to = P.accountIdx
           LEFT JOIN (SELECT status, postIdx, tagIdx FROM PostTags) AS PT ON PT.postIdx = P.postIdx
           LEFT JOIN (SELECT tagIdx, tagName FROM Tags) T ON PT.tagIdx = T.tagIdx
    WHERE F.\`from\` = ? AND P.postIdx = ? AND PT.status = 'ACTIVE';

  `;

    const selectUserAccountRow = await connection.query(
        selectPostsQuery,
        [accountIdx, postIdxList]
    );


    return selectUserAccountRow[0];
};


// 홈화면 게시물 좋아요 여부 리스트
async function selectPostLikes(connection, accountIdx, postIdxList) {
    const selectPostsQuery = `
    SELECT COUNT(case when status = 'ACTIVE' AND accountIdx = ? AND postIdx = ? then 1 end) as isPostLiked FROM PostLikes;
  `;

    const selectUserAccountRow = await connection.query(
        selectPostsQuery,
        [accountIdx, postIdxList]
    );


    return selectUserAccountRow[0];
};

// 홈화면 게시물 좋아요 총 갯수
async function selectAllPostLikes(connection, postIdx) {
    const selectPostsQuery = `
    SELECT COUNT(*) as postLikeTotal FROM PostLikes WHERE postIdx = ? AND status = 'ACTIVE';
  `;

    const countPostLikes = await connection.query(
        selectPostsQuery,
        postIdx
    );


    return countPostLikes[0];
};

// 홈화면 댓글 총 갯수
async function selectAllCommentsCount(connection, postIdx) {
    const selectPostsQuery = `
    SELECT COUNT(*) as commentTotal FROM Comments WHERE postIdx = ? AND status = 'ACTIVE';
  `;

    const countPostLikes = await connection.query(
        selectPostsQuery,
        postIdx
    );


    return countPostLikes[0];
};



// 내 피드 프로필 데이터
async function selectMyFeedData(connection, accountIdx) {
    const selectFeedDataQuery = `
    SELECT A.accountIdx, A.accountName, A.name, A.profilePhotoUrl, A.bio,
       P.postCnt,
       F.FollowerCnt, F.FollowingCnt FROM Accounts A
    LEFT JOIN (SELECT accountIdx, COUNT(case when accountIdx = ${accountIdx} AND status = 'ACTIVE' then 1 end) as postCnt FROM Posts) P ON A.accountIdx
    LEFT JOIN (SELECT COUNT(case when \`to\` = ${accountIdx} and status = 'ACTIVE' AND \`from\` != ${accountIdx} then 1 end) as FollowerCnt,
                  COUNT(case when \`from\`= ${accountIdx} and status = 'ACTIVE' AND \`to\` != ${accountIdx} then 1 end) as FollowingCnt FROM Follows ) F ON A.accountIdx
    WHERE A.accountIdx = ${accountIdx}; 
    `;
    const selectFeedRow = await connection.query(
        selectFeedDataQuery
    );
    return selectFeedRow[0];
};

// 내 active 스토리 카운트
async function selectIfStoryExist(connection, accountIdx) {
    const selectIfStoryExistQuery = `
    SELECT COUNT(*) as storyCnt FROM Stories 
    WHERE accountIdx = ${accountIdx} AND status = 'ACTIVE' AND updatedAt > DATE_ADD(now(), INTERVAL -1 DAY);
  `;
    const selectFeedRow = await connection.query(
        selectIfStoryExistQuery
    );
    return selectFeedRow[0];
};



// 내 피드 커버 이미지 데이터
async function selectMyFeedCoverPhotos(connection, accountIdx) {
    const selectFeedDataQuery = `
    SELECT postIdx, url, COUNT(*) as photoCnt FROM PostPhotoUrls 
    WHERE accountIdx= ${accountIdx} AND status = 'ACTIVE'
    GROUP BY postIdx;
  `;
    const selectFeedRow = await connection.query(
        selectFeedDataQuery
    );
    return selectFeedRow[0];
};



// 특정 포스트 좋아요 총 수
async function selectPostLikeCount(connection, postIdx) {
    const selectFeedDataQuery = `
    SELECT COUNT(case when postIdx = ? AND status = 'ACTIVE' then 1 end) as likeTotal FROM PostLikes;
  `;
    const selectFeedRow = await connection.query(
        selectFeedDataQuery, postIdx
    );
    return selectFeedRow[0];
};


//새 게시물 올리기
async function insertNewPost(connection, reqBody) {

    const insertPostQuery = `
    INSERT INTO Posts(communityIdx, userIdx, caption)
    VALUES (?, ?, ?);
  `;
    const insertPostRow = await connection.query(
        insertPostQuery, [reqBody.communityIdx, reqBody.userIdx, reqBody.caption]
    );

    return insertPostRow[0];
};

//새로 생성된 postIdx 가져오기
async function selectLastInsertedPost(connection) {
    const selectPostQuery = `
    SELECT LAST_INSERT_ID() as postIdx FROM Posts;
  `;
    const selectPostRow = await connection.query(
        selectPostQuery
    );

    return selectPostRow[0];
};


//새 게시물 사진 리스트 올리기
async function insertPostPhotoUrls(connection, postIdx, accountIdx, url) {
    const insertPostQuery = `
    INSERT INTO PostPhotoUrls(postIdx, accountIdx, url)
    VALUES (?, ?, ?);
  `;
    const insertPostRow = await connection.query(
        insertPostQuery, [postIdx, accountIdx, url]
    );

    return insertPostRow[0];
};




//게시된 태그 저장
async function insertTag(connection, tagName) {
    //태그들을 저장한다.
    const insertTagQuery = `
        INSERT IGNORE INTO HashTags(tagName) VALUES (?);
    `;


    const insertTagRow = await connection.query(
        insertTagQuery,
        tagName
    );



    return insertTagRow[0];
}

//입력한 태그들의 tagIdx 알아내기
async function selectTagByTagName(connection, tagName) {
    //for 문으로 입력한 태그들의 인덱스를 가져온다.
    const selectTagQuery = `
        SELECT tagIdx FROM HashTags WHERE tagName = ? AND status = 'ACTIVE';
    `;

    const selectTagRow = await connection.query(
        selectTagQuery,
        tagName
    );

    return selectTagRow[0];
}


//게시물 태그에 등록하기
async function insertPostTags(connection, tagIdx, postIdx) {

    const insertStoryTagQuery = `
        INSERT INTO PostTags(postIdx, tagIdx) VALUES (?, ?);
    `;

    const insertStoryTagRow = await connection.query(
        insertStoryTagQuery,
        [postIdx, tagIdx]
    );

    return insertStoryTagRow[0];
}

//팔로잉 유무 찾기
async function selectIsFollowing(connection, myAccountIdx, accountIdx) {

    const insertStoryTagQuery = `
    SELECT COUNT(*) as isFollowing
    FROM Follows
    WHERE \`from\` = ?
      AND \`to\` = ?
      AND status = 'ACTIVE' ;
    `;

    const insertStoryTagRow = await connection.query(
        insertStoryTagQuery,
        [myAccountIdx, accountIdx]
    );

    return insertStoryTagRow[0];
}

// 특정 유저의 포스팅 리스트
async function selectPostFromOne(connection, accountIdx) {
    const selectPostsQuery = `
    SELECT A.accountIdx,
           A.accountName,
           A.profilePhotoUrl,
           P.postIdx,
           P.caption,
           CASE
             WHEN TIMESTAMPDIFF(MINUTE, P.updatedAt, NOW()) <= 0 THEN '방금 전'
             WHEN TIMESTAMPDIFF(MINUTE, P.updatedAt, NOW()) < 60
               THEN CONCAT(TIMESTAMPDIFF(MINUTE, P.updatedAt, NOW()), '분 전')
             WHEN TIMESTAMPDIFF(HOUR, P.updatedAt, NOW()) < 24
               THEN CONCAT(TIMESTAMPDIFF(HOUR, P.updatedAt, NOW()), '시간 전')
             WHEN TIMESTAMPDIFF(DAY, P.updatedAt, NOW()) < 30 THEN CONCAT(TIMESTAMPDIFF(DAY, P.updatedAt, NOW()), '일 전')
             ELSE CONCAT(TIMESTAMPDIFF(MONTH, P.updatedAt, NOW()), '달 전')
             END AS agoTime
    FROM Posts P
           LEFT JOIN (SELECT accountIdx, accountName, profilePhotoUrl FROM Accounts) A ON A.accountIdx = P.accountIdx
    WHERE P.accountIdx = ? AND status = 'ACTIVE'
    ORDER BY P.updatedAt DESC;
    `;

    const selectUserAccountRow = await connection.query(
        selectPostsQuery,
        accountIdx
    );


    var postIdxList = [];
    for(var i = 0; i<selectUserAccountRow[0].length; i++){
        // postIdxList.push(selectUserAccountRow[0][i].postIdx);
        const photoUrlListResult = await selectPostPhotoUrls(connection, accountIdx, selectUserAccountRow[0][i].postIdx);
        const tagListResult = await selectPostTags(connection, accountIdx, selectUserAccountRow[0][i].postIdx);
        const commentPreviewListResult = await selectCommentPreviews(connection, accountIdx, selectUserAccountRow[0][i].postIdx);
        const postLikeListResult = await selectPostLikes(connection, accountIdx, selectUserAccountRow[0][i].postIdx);
        const postTotalLikeResult = await selectAllPostLikes(connection,selectUserAccountRow[0][i].postIdx);
        const postTotalCommentResult = await selectAllCommentsCount(connection,selectUserAccountRow[0][i].postIdx);

        const postPhotoUrlListObj = {
            postIdx : selectUserAccountRow[0][i].postIdx,
            urlList: photoUrlListResult
        }

        const tagListObj = {
            postIdx : selectUserAccountRow[0][i].postIdx,
            tagList: tagListResult
        }

        const commentListObj = {
            postIdx : selectUserAccountRow[0][i].postIdx,
            commentList: commentPreviewListResult
        }


        const Result ={
            postList: Object.assign(
                selectUserAccountRow[0][i],
                postLikeListResult[0],
                postTotalLikeResult[0],
                postTotalCommentResult[0]
            ),
            postPhotoUrlListObj: postPhotoUrlListObj,
            postTagList: tagListObj,
            commentPreview: commentListObj,
        }

        postIdxList.push(Result);
    }


    return postIdxList;
};


//게시물 업데이트
async function updatePost(connection, reqBody) {

    const insertStoryTagQuery = `
        UPDATE Posts SET caption = ? WHERE postIdx = ?;
    `;

    const insertStoryTagRow = await connection.query(
        insertStoryTagQuery,
        [reqBody.caption, reqBody.postIdx]
    );


    return insertStoryTagRow[0];
}

//게시물 삭제
async function deletePost(connection, reqBody) {

    const insertStoryTagQuery = `
        UPDATE Posts SET status = ? WHERE postIdx = ?;
    `;

    const insertStoryTagRow = await connection.query(
        insertStoryTagQuery,
        [reqBody.action, reqBody.postIdx]
    );


    return insertStoryTagRow[0];
}


//게시물에 원래 붙어 있던 태그 삭제
async function updatePostTags(connection, status, postIdx) {

    const insertStoryTagQuery = `
        UPDATE PostTags SET status = ? WHERE postIdx = ?;
    `;


    const insertStoryTagRow = await connection.query(
        insertStoryTagQuery,
        [status, postIdx]
    );

    return insertStoryTagRow[0];
}

//게시물에 원래 붙어 있던 태그 삭제
async function updateOnePostTag(connection, status, postIdx, tagIdx) {

    const insertStoryTagQuery = `
        UPDATE PostTags SET status = ? WHERE postIdx = ? AND tagIdx = ?;
    `;


    const insertStoryTagRow = await connection.query(
        insertStoryTagQuery,
        [status, postIdx, tagIdx]
    );

    return insertStoryTagRow[0];
}

//원래 있던 태그인지 확인
async function selectPostTagByTagIdx(connection, postIdx, tagIdx) {

    const insertStoryTagQuery = `
        SELECT COUNT(*) as Cnt FROM PostTags WHERE postIdx = ? AND tagIdx = ?;
    `;


    const insertStoryTagRow = await connection.query(
        insertStoryTagQuery,
        [postIdx, tagIdx]
    );

    return insertStoryTagRow[0];
}

//사진 url 삭제
async function updatePostPhotoUrl(connection, status, postIdx) {

    const insertStoryTagQuery = `
        UPDATE PostPhotoUrls SET status = ? WHERE postIdx = ?;
    `;


    const insertStoryTagRow = await connection.query(
        insertStoryTagQuery,
        [status, postIdx]
    );

    return insertStoryTagRow[0];
}

//댓글 삭제
async function updateComments(connection, status, postIdx) {

    const insertStoryTagQuery = `
        UPDATE Comments SET status = ? WHERE postIdx = ?;
    `;


    const insertStoryTagRow = await connection.query(
        insertStoryTagQuery,
        [status, postIdx]
    );

    return insertStoryTagRow[0];
}

//댓글 좋아요 삭제
async function updateCommentLikes(connection, status, postIdx) {

    const insertStoryTagQuery = `
        UPDATE CommentLikes SET status = ? WHERE postIdx = ?;
    `;


    const insertStoryTagRow = await connection.query(
        insertStoryTagQuery,
        [status, postIdx]
    );

    return insertStoryTagRow[0];
}

//게시물 좋아요 삭제
async function updatePostLikes(connection, status, postIdx) {

    const insertStoryTagQuery = `
        UPDATE PostLikes SET status = ? WHERE postIdx = ?;
    `;


    const insertStoryTagRow = await connection.query(
        insertStoryTagQuery,
        [status, postIdx]
    );

    return insertStoryTagRow[0];
}


module.exports = {

    selectPostFromFollowingUsers,
    selectMyFeedData,
    selectMyFeedCoverPhotos,
    selectIfStoryExist,
    selectPostPhotoUrls,
    selectPostTags,
    selectCommentPreviews,
    selectPostLikes,
    selectPostLikeCount,
    insertNewPost,
    selectLastInsertedPost,
    insertPostPhotoUrls,
    insertTag,
    selectTagByTagName,
    insertPostTags,
    selectAllPostLikes,
    selectAllCommentsCount,
    selectPostFromOne,
    selectIsFollowing,
    updatePost,
    updatePostTags,
    selectPostTagByTagIdx,
    deletePost,
    updatePostPhotoUrl,
    updateComments,
    updateCommentLikes,
    updatePostLikes,
    updateOnePostTag




};

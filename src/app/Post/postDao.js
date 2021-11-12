

// 홈화면 포스팅 리스트
async function selectPostList(connection, page, limit, communityIdx) {

    const selectPostsQuery = `
        SELECT A.userIdx, A.nickname, A.profilePhotoUrl,
               P.postIdx, P.caption
        FROM Posts P
        LEFT JOIN (SELECT userIdx, nickname, profilePhotoUrl FROM Users) A ON A.userIdx = P.userIdx
        WHERE P.status = 'ACTIVE' AND P.communityIdx = ?
        ORDER BY P.updatedAt DESC LIMIT ? OFFSET ?;
    `;

    const selectUserAccountRow = await connection.query(
        selectPostsQuery,
        [communityIdx, limit, page]
    );


    return selectUserAccountRow[0];
};

// 홈화면 포스팅 사진 리스트
async function selectPostPhotoUrls(connection, userIdx, postIdx) {
    const selectPostsQuery = `
    SELECT PPU.url
    FROM PostPhotoUrls PPU
    WHERE PPU.postIdx = ? AND PPU.status = 'ACTIVE';
  `;

    const selectPostPhotoRow = await connection.query(
        selectPostsQuery,
        postIdx
    );

    return selectPostPhotoRow[0];
};



// 게시물 좋아요 여부 리스트
async function selectIfPostLiked(connection, userIdx, postIdx) {
    const selectPostsQuery = `
    SELECT COUNT(*) as isPostLiked FROM PostLikes
        WHERE status = 'ACTIVE' AND userIdx = ? AND postIdx = ?;
  `;

    const selectUserAccountRow = await connection.query(
        selectPostsQuery,
        [userIdx, postIdx]
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
    const countAllPostCommentsQuery = `
    SELECT COUNT(*) as commentTotal FROM Comments WHERE postIdx = ? AND status = 'ACTIVE';
  `;

    const countAllPostCommentsRow = await connection.query(
        countAllPostCommentsQuery,
        postIdx
    );


    return countAllPostCommentsRow[0];
};





//새 게시물 올리기
async function insertNewPost(connection, reqBody, userIdx) {

    const insertPostQuery = `
    INSERT INTO Posts(communityIdx, userIdx, caption)
    VALUES (?, ?, ?);
  `;
    const insertPostRow = await connection.query(
        insertPostQuery, [reqBody.communityIdx, userIdx, reqBody.caption]
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
async function insertPostPhotoUrls(connection, postIdx, userIdx, url) {
    const insertPostQuery = `
    INSERT INTO PostPhotoUrls(postIdx, userIdx, url)
    VALUES (?, ?, ?);
  `;
    const insertPostRow = await connection.query(
        insertPostQuery, [postIdx, userIdx, url]
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



//팔로잉 유무 찾기
async function selectIfFollowing(connection, loginUserIdx, toUserIdx) {

    const selectIsFollowingQuery = `
    SELECT COUNT(*) as isFollowing FROM UserFollowings
    WHERE fromUserIdx = ? AND toUserIdx = ? AND status = 'ACTIVE' ;
    `;

    const selectIsFollowingRow = await connection.query(
        selectIsFollowingQuery,
        [loginUserIdx, toUserIdx]
    );

    return selectIsFollowingRow[0];
}


//게시물 업데이트
async function updatePost(connection, reqBody) {

    const insertStoryTagQuery = `
        UPDATE Posts SET caption = ?, communityIdx = ? WHERE postIdx = ?;
    `;

    const insertStoryTagRow = await connection.query(
        insertStoryTagQuery,
        [reqBody.caption, reqBody.communityIdx, reqBody.postIdx]
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

    selectPostList,
    selectPostPhotoUrls,
    selectIfPostLiked,
    insertNewPost,
    selectLastInsertedPost,
    insertPostPhotoUrls,
    insertTag,
    selectTagByTagName,
    selectAllPostLikes,
    selectAllCommentsCount,
    selectIfFollowing,
    updatePost,
    deletePost,
    updatePostPhotoUrl,
    updateComments,
    updatePostLikes,

};


//새 댓글 저장
async function insertComment(connection, reqBody) {

    const insertCommentQuery = `
        INSERT INTO Comments(userIdx, postIdx, content) VALUES (?, ?, ?);
    `;

    const insertCommentRow = await connection.query(
        insertCommentQuery,
        [reqBody.userIdx, reqBody.postIdx, reqBody.content]
    );

    return insertCommentRow[0];
}

//댓글 리스트 불러오기
async function selectCommentList(connection, userIdx, postIdx) {

    const selectCommentQuery = `
        SELECT C.commentIdx, C.postIdx, C.userIdx, C.content,
               A.nickname, A.profilePhotoUrl,
               CASE
                   WHEN TIMESTAMPDIFF(MINUTE, C.updatedAt, NOW()) <= 0 THEN '방금 전'
                   WHEN TIMESTAMPDIFF(MINUTE, C.updatedAt, NOW()) < 60
                       THEN CONCAT(TIMESTAMPDIFF(MINUTE, C.updatedAt, NOW()), '분 전')
                   WHEN TIMESTAMPDIFF(HOUR, C.updatedAt, NOW()) < 24
                       THEN CONCAT(TIMESTAMPDIFF(HOUR, C.updatedAt, NOW()), '시간 전')
                   WHEN TIMESTAMPDIFF(DAY, C.updatedAt, NOW()) < 30 THEN CONCAT(TIMESTAMPDIFF(DAY, C.updatedAt, NOW()), '일 전')
                   ELSE CONCAT(TIMESTAMPDIFF(MONTH, C.updatedAt, NOW()), '달 전')
                   END AS agoTime FROM Comments C
    LEFT JOIN (SELECT userIdx, nickname, profilePhotoUrl FROM Users) A ON A.userIdx = C.userIdx
        WHERE C.postIdx = ? AND C.status = 'ACTIVE'
          AND C.userIdx not in (SELECT toUserIdx FROM BlockUsers WHERE fromUserIdx = ? )
          AND C.userIdx not in (SELECT fromUserIdx FROM BlockUsers WHERE toUserIdx = ? )
        ORDER BY C.updatedAt DESC ;
    `;

    const selectCommentRow = await connection.query(
        selectCommentQuery,
        [postIdx, userIdx, userIdx]
    );

    return selectCommentRow[0];
}

//댓글 윗부분 포스트 데이터 불러오기
async function selectPostData(connection, postIdx) {

    const selectPostDataQuery = `
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
        WHERE P.postIdx = ?;
    `;

    const selectPostDataRow = await connection.query(
        selectPostDataQuery,
        postIdx
    );

    return selectPostDataRow[0];
}

// 포스팅 태그 리스트
async function selectPostTags(connection, postIdx) {
    const selectTagsQuery = `
        SELECT PT.tagIdx, T.tagName
        FROM Posts P
                 LEFT JOIN (SELECT postIdx, tagIdx, status FROM PostTags) AS PT ON PT.postIdx = P.postIdx
                 LEFT JOIN (SELECT tagIdx, tagName FROM Tags) T ON PT.tagIdx = T.tagIdx
        WHERE P.postIdx = ? AND PT.status = 'ACTIVE';

  `;

    const selectTagsRow = await connection.query(
        selectTagsQuery,
        postIdx
    );


    return selectTagsRow[0];
};

//댓글 다시 추가/삭제
async function updateComment(connection, reqBody, status) {

    const updateCommentQuery = `
        UPDATE Comments SET status = ? WHERE commentIdx = ?;
    `;


    const updateCommentRow = await connection.query(
        updateCommentQuery,
        [status, reqBody.commentIdx]
    );

    return updateCommentRow[0];
}




module.exports = {
    insertComment,
    selectCommentList,
    selectPostData,
    selectPostTags,
    updateComment


};

//신고하기
async function insertReport(connection, reportInfo) {

    const insertReportQuery = `
    INSERT INTO Reports(userIdx, sort, idx, content)
    VALUES (?, ?, ?, ?);
  `;
    const insertReportRow = await connection.query(
        insertReportQuery, [reportInfo.userIdx, reportInfo.sort, reportInfo.idx, reportInfo.content]
    );

    return insertReportRow[0];
};


//유저 차단하기
async function insertBlockUser(connection, reportInfo) {

    const insertReportQuery = `
    INSERT INTO BlockUsers(fromUserIdx, toUserIdx)
    VALUES (?, ?);
  `;

    const insertReportRow = await connection.query(
        insertReportQuery, [reportInfo.fromUserIdx, reportInfo.toUserIdx]
    );

    return insertReportRow[0];
};




module.exports = {

    insertReport,
    insertBlockUser

}
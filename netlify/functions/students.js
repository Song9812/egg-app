const { STUDENTS_SHEET, getSheetValues, corsHeaders } = require('./_sheets');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }

  const { grade, classNum } = event.queryStringParameters || {};

  if (!grade || !classNum) {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'grade and classNum required' }),
    };
  }

  try {
    const values = await getSheetValues(STUDENTS_SHEET);
    values.shift();

    const students = values
      .filter(row => {
        const active = row[10] === 'TRUE' || row[10] === true;
        return (
          String(row[1]) === String(grade) &&
          String(row[2]) === String(classNum) &&
          active
        );
      })
      .map(row => ({
        studentId: row[0],
        grade: row[1],
        classNum: row[2],
        number: row[3],
        name: row[4],
        presentationCount: Number(row[5]) || 0,
        eggs: Number(row[6]) || 0,
        totalHatch: Number(row[7]) || 0,
        lastReward: row[8] || '',
        lastRewardImage: row[9] || '',
      }));

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify(students),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: err.message }),
    };
  }
};

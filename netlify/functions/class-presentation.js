const { STUDENTS_SHEET, getSheetValues, setCell, corsHeaders } = require('./_sheets');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(), body: 'Method Not Allowed' };
  }

  const { grade, classNum } = JSON.parse(event.body || '{}');

  try {
    const values = await getSheetValues(STUDENTS_SHEET);
    const eggEarnedStudents = [];

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const active = row[10] === 'TRUE' || row[10] === true;

      if (
        String(row[1]) === String(grade) &&
        String(row[2]) === String(classNum) &&
        active
      ) {
        let presentationCount = Number(row[5]) || 0;
        let eggs = Number(row[6]) || 0;

        presentationCount++;

        if (presentationCount % 10 === 0) {
          eggs++;
          eggEarnedStudents.push({ studentId: row[0] });
        }

        await setCell(STUDENTS_SHEET, i + 1, 6, presentationCount);
        await setCell(STUDENTS_SHEET, i + 1, 7, eggs);
      }
    }

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ success: true, eggEarnedStudents }),
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

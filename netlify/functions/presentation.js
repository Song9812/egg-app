const { STUDENTS_SHEET, getSheetValues, setCell, corsHeaders } = require('./_sheets');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(), body: 'Method Not Allowed' };
  }

  const { studentId } = JSON.parse(event.body || '{}');

  try {
    const values = await getSheetValues(STUDENTS_SHEET);

    for (let i = 1; i < values.length; i++) {
      const row = values[i];

      if (String(row[0]) === String(studentId)) {
        let presentationCount = Number(row[5]) || 0;
        let eggs = Number(row[6]) || 0;

        presentationCount++;
        let eggEarned = false;

        if (presentationCount % 10 === 0) {
          eggs++;
          eggEarned = true;
        }

        await setCell(STUDENTS_SHEET, i + 1, 6, presentationCount);
        await setCell(STUDENTS_SHEET, i + 1, 7, eggs);

        return {
          statusCode: 200,
          headers: corsHeaders(),
          body: JSON.stringify({ success: true, presentationCount, eggs, eggEarned }),
        };
      }
    }

    return {
      statusCode: 404,
      headers: corsHeaders(),
      body: JSON.stringify({ success: false }),
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

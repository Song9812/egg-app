const { STUDENTS_SHEET, getSheetValues, setCell, corsHeaders } = require('../_sheets');

export async function onRequest(context) {
  const { request, env } = context;

  Object.assign(process.env, env);

  if (request.method === 'OPTIONS') {
    return new Response('', { status: 200, headers: corsHeaders() });
  }

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders() });
  }

  const { grade, classNum } = await request.json();

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

    return new Response(JSON.stringify({ success: true, eggEarnedStudents }), {
      status: 200,
      headers: corsHeaders(),
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders(),
    });
  }
}

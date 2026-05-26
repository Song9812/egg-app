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

  const { studentId } = await request.json();

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

        return new Response(JSON.stringify({ success: true, presentationCount, eggs, eggEarned }), {
          status: 200,
          headers: corsHeaders(),
        });
      }
    }

    return new Response(JSON.stringify({ success: false }), {
      status: 404,
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

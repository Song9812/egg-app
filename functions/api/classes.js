const { STUDENTS_SHEET, getSheetValues, corsHeaders } = require('../_sheets');

export async function onRequest(context) {
  const { request, env } = context;

  // env를 process.env에 주입
  Object.assign(process.env, env);

  if (request.method === 'OPTIONS') {
    return new Response('', { status: 200, headers: corsHeaders() });
  }

  try {
    const values = await getSheetValues(STUDENTS_SHEET);
    values.shift();

    const classes = [...new Set(
      values
        .filter(row => row[10] === 'TRUE' || row[10] === true)
        .map(row => `${row[1]}-${row[2]}`)
    )].sort();

    return new Response(JSON.stringify(classes), {
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

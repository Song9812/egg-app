const { STUDENTS_SHEET, getSheetValues, corsHeaders } = require('../_sheets');

export async function onRequest(context) {
  const { request, env } = context;

  Object.assign(process.env, env);

  if (request.method === 'OPTIONS') {
    return new Response('', { status: 200, headers: corsHeaders() });
  }

  const url = new URL(request.url);
  const grade = url.searchParams.get('grade');
  const classNum = url.searchParams.get('classNum');

  if (!grade || !classNum) {
    return new Response(JSON.stringify({ error: 'grade and classNum required' }), {
      status: 400,
      headers: corsHeaders(),
    });
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

    return new Response(JSON.stringify(students), {
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

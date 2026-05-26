const {
  STUDENTS_SHEET,
  COLLECTION_SHEET,
  REWARDS_SHEET,
  getSheetValues,
  setCell,
  appendRow,
  corsHeaders,
} = require('../_sheets');

function pickReward(rewards) {
  let total = rewards.reduce((sum, r) => sum + Number(r[4]), 0);
  let random = Math.random() * total;
  let current = 0;

  for (const r of rewards) {
    current += Number(r[4]);
    if (random <= current) {
      return { id: r[0], name: r[1], image: r[2], rarity: r[3], probability: r[4] };
    }
  }
  return null;
}

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
    const [students, rewards] = await Promise.all([
      getSheetValues(STUDENTS_SHEET),
      getSheetValues(REWARDS_SHEET),
    ]);

    const activeRewards = rewards.slice(1).filter(r => r[5] === 'TRUE' || r[5] === true);

    for (let i = 1; i < students.length; i++) {
      const row = students[i];

      if (String(row[0]) === String(studentId)) {
        let eggs = Number(row[6]) || 0;
        let totalHatch = Number(row[7]) || 0;

        if (eggs <= 0) {
          return new Response(JSON.stringify({ success: false }), {
            status: 200,
            headers: corsHeaders(),
          });
        }

        const reward = pickReward(activeRewards);
        eggs--;
        totalHatch++;

        await setCell(STUDENTS_SHEET, i + 1, 7, eggs);
        await setCell(STUDENTS_SHEET, i + 1, 8, totalHatch);
        await setCell(STUDENTS_SHEET, i + 1, 9, reward.name);
        await setCell(STUDENTS_SHEET, i + 1, 10, reward.image);

        await appendRow(COLLECTION_SHEET, [
          row[0],
          row[4],
          reward.id,
          reward.name,
          reward.rarity,
          new Date().toISOString(),
        ]);

        return new Response(JSON.stringify({ success: true, eggs, totalHatch, reward }), {
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

const {
  STUDENTS_SHEET,
  COLLECTION_SHEET,
  REWARDS_SHEET,
  getSheetValues,
  setCell,
  appendRow,
  corsHeaders,
} = require('./_sheets');

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

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(), body: 'Method Not Allowed' };
  }

  const { studentId } = JSON.parse(event.body || '{}');

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
          return {
            statusCode: 200,
            headers: corsHeaders(),
            body: JSON.stringify({ success: false }),
          };
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

        return {
          statusCode: 200,
          headers: corsHeaders(),
          body: JSON.stringify({ success: true, eggs, totalHatch, reward }),
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

const { STUDENTS_SHEET, getSheetValues, setCell, corsHeaders } = require('./_sheets');

export default async function handler(req, res) {
  corsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { studentId } = req.body;

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

        return res.status(200).json({ success: true, presentationCount, eggs, eggEarned });
      }
    }

    return res.status(404).json({ success: false });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

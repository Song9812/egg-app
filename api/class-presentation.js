const { STUDENTS_SHEET, getSheetValues, setCell, corsHeaders } = require('./_sheets');

export default async function handler(req, res) {
  corsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { grade, classNum } = req.body;

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

    return res.status(200).json({ success: true, eggEarnedStudents });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

const { STUDENTS_SHEET, getSheetValues, corsHeaders } = require('./_sheets');

export default async function handler(req, res) {
  corsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { grade, classNum } = req.query;

  if (!grade || !classNum) {
    return res.status(400).json({ error: 'grade and classNum required' });
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

    return res.status(200).json(students);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

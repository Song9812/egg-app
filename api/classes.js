const { STUDENTS_SHEET, getSheetValues, corsHeaders } = require('./_sheets');

export default async function handler(req, res) {
  corsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const values = await getSheetValues(STUDENTS_SHEET);
    values.shift();

    const classes = [...new Set(
      values
        .filter(row => row[10] === 'TRUE' || row[10] === true)
        .map(row => `${row[1]}-${row[2]}`)
    )].sort();

    return res.status(200).json(classes);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

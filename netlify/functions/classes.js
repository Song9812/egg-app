const { STUDENTS_SHEET, getSheetValues, corsHeaders } = require('./_sheets');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }

  try {
    const values = await getSheetValues(STUDENTS_SHEET);
    values.shift(); // remove header

    const classes = [...new Set(
      values
        .filter(row => row[10] === 'TRUE' || row[10] === true)
        .map(row => `${row[1]}-${row[2]}`)
    )].sort();

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify(classes),
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

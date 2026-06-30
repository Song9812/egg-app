const { corsHeaders } = require('./_sheets');

export default async function handler(req, res) {
  corsHeaders(res);

  if (req.method === 'OPTIONS') return res.status(200).end();

  return res.status(200).json({ spreadsheetId: process.env.SPREADSHEET_ID });
}

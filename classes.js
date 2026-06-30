const {
  STUDENTS_SHEET,
  COLLECTION_SHEET,
  REWARDS_SHEET,
  getSheetValues,
  corsHeaders,
} = require('./_sheets');

export default async function handler(req, res) {
  corsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { type, studentId, grade, classNum } = req.query;

  try {
    if (type === 'student') {
      return await studentCollection(studentId, res);
    } else if (type === 'class') {
      return await classCollection(grade, classNum, res);
    } else {
      return res.status(400).json({ error: 'type must be student or class' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

async function studentCollection(studentId, res) {
  const [collections, rewards] = await Promise.all([
    getSheetValues(COLLECTION_SHEET),
    getSheetValues(REWARDS_SHEET),
  ]);

  const rewardMap = {};
  rewards.slice(1).forEach(r => { rewardMap[r[0]] = r[2]; });

  const result = {};
  collections.slice(1).forEach(row => {
    if (String(row[0]) !== String(studentId)) return;

    const rewardId = row[2];
    if (!result[rewardId]) {
      result[rewardId] = {
        name: row[3],
        rarity: row[4],
        image: rewardMap[rewardId] || '❓',
        count: 0,
      };
    }
    result[rewardId].count++;
  });

  return res.status(200).json(Object.values(result));
}

async function classCollection(grade, classNum, res) {
  const [students, collections, rewards] = await Promise.all([
    getSheetValues(STUDENTS_SHEET),
    getSheetValues(COLLECTION_SHEET),
    getSheetValues(REWARDS_SHEET),
  ]);

  const studentMap = {};
  students.slice(1)
    .filter(row =>
      String(row[1]) === String(grade) &&
      String(row[2]) === String(classNum) &&
      (row[10] === 'TRUE' || row[10] === true)
    )
    .forEach(row => { studentMap[String(row[0])] = row[4]; });

  const studentIds = Object.keys(studentMap);

  const ownedMap = {};
  collections.slice(1).forEach(row => {
    const sid = String(row[0]);
    if (!studentIds.includes(sid)) return;
    const rewardId = String(row[2]);
    if (!ownedMap[rewardId]) ownedMap[rewardId] = [];
    ownedMap[rewardId].push(studentMap[sid]);
  });

  const result = rewards.slice(1).map(r => ({
    id: String(r[0]),
    name: r[1],
    image: r[2],
    rarity: r[3],
    obtained: !!ownedMap[String(r[0])],
    obtainedBy: ownedMap[String(r[0])] || [],
  }));

  return res.status(200).json(result);
}

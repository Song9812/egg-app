const {
  STUDENTS_SHEET,
  COLLECTION_SHEET,
  REWARDS_SHEET,
  getSheetValues,
  corsHeaders,
} = require('./_sheets');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }

  const params = event.queryStringParameters || {};
  const { type, studentId, grade, classNum } = params;

  try {
    if (type === 'student') {
      return await studentCollection(studentId);
    } else if (type === 'class') {
      return await classCollection(grade, classNum);
    } else {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'type must be student or class' }),
      };
    }
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: err.message }),
    };
  }
};

async function studentCollection(studentId) {
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

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify(Object.values(result)),
  };
}

async function classCollection(grade, classNum) {
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

  // rewardId → 획득한 학생 이름 목록 (선착순)
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

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify(result),
  };
}

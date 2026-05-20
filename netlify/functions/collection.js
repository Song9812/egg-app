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

  const studentIds = students
    .slice(1)
    .filter(row =>
      String(row[1]) === String(grade) &&
      String(row[2]) === String(classNum) &&
      (row[10] === 'TRUE' || row[10] === true)
    )
    .map(row => String(row[0]));

  const ownedSet = new Set();
  collections.slice(1).forEach(row => {
    if (studentIds.includes(String(row[0]))) {
      ownedSet.add(String(row[2]));
    }
  });

  const result = rewards.slice(1).map(r => ({
    id: String(r[0]),
    name: r[1],
    image: r[2],
    rarity: r[3],
    obtained: ownedSet.has(String(r[0])),
  }));

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify(result),
  };
}

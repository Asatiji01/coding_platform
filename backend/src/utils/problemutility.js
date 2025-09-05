const axios = require('axios');

const getLanguageById = (lang) => {
  const language = {
    "c++": 54,
    "java": 62,
    "javascript": 63
  };
  return language[lang.toLowerCase()];
};

const submitBatch = async (submissions) => {
  const options = {
    method: 'POST',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: { base64_encoded: 'false' },
   headers: {
    'x-rapidapi-key': 'd67c7dbc3dmshf1a0b96f9893646p113347jsnb1f7295393d8',
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
    'Content-Type': 'application/json'
  },
    data: { submissions }
  };

  try {
    const response = await axios.request(options);
    return response.data; // { submissions: [ { token: ...}, ... ] }
  } catch (error) {
    // console.error("submitBatch error:", error.response?.data || error.message);
    throw error;
  }
};

// Proper promise-based wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const submitToken = async (resultTokens) => {
  const tokens = Array.isArray(resultTokens) ? resultTokens.join(",") : resultTokens;

  const options = {
    method: 'GET',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      tokens,
      base64_encoded: 'false',
      fields: '*'
    },
     headers: {
    'x-rapidapi-key': 'd67c7dbc3dmshf1a0b96f9893646p113347jsnb1f7295393d8',
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
  }
  };

  while (true) {
    try {
      const response = await axios.request(options);
      const result = response.data;

      // console.log(" Raw Judge0 batch result:", JSON.stringify(result, null, 2));

      if (result.submissions && result.submissions.every(r => r && r.status_id > 2)) {
        return result.submissions; //  final results
      }
    } catch (error) {
      // console.error("submitToken error:", error.response?.data || error.message);
      throw error;
    }

    // wait before retrying
    await wait(1000);
  }
};

module.exports = { getLanguageById, submitBatch, submitToken };

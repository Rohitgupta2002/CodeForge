const axios = require('axios');

const JUDGE0_PROVIDER = process.env.JUDGE0_PROVIDER || 'public';
const JUDGE0_BASE_URL = process.env.JUDGE0_BASE_URL || (JUDGE0_PROVIDER === 'rapidapi'
  ? 'https://judge0-ce.p.rapidapi.com'
  : 'https://ce.judge0.com');
const POLL_INTERVAL_MS = Number(process.env.JUDGE0_POLL_INTERVAL_MS || 1000);
const MAX_POLL_ATTEMPTS = Number(process.env.JUDGE0_MAX_POLL_ATTEMPTS || 20);

const getLanguageById = (lang) => {
  const language = { 'c++': 54, java: 62, javascript: 63 };
  return language[lang.toLowerCase()];
};

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const judge0Headers = () => {
  if (JUDGE0_PROVIDER === 'rapidapi') {
    return {
      'x-rapidapi-key': process.env.JUDGE0_KEY,
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      'Content-Type': 'application/json'
    };
  }

  return { 'Content-Type': 'application/json' };
};

const getJudge0Error = (error) => {
  const response = error.response;
  const message = response?.data?.message || response?.data?.error || error.message;
  const judge0Error = new Error(`Judge0 request failed: ${message}`);
  judge0Error.statusCode = response?.status || 502;
  judge0Error.isRateLimit = response?.status === 429;
  judge0Error.isSubscription = response?.status === 403 && /not subscribed|subscription/i.test(message);
  return judge0Error;
};

const createSubmission = async (submission) => {
  if (JUDGE0_PROVIDER === 'rapidapi' && !process.env.JUDGE0_KEY) {
    const configurationError = new Error('JUDGE0_KEY is missing from the backend .env file');
    configurationError.statusCode = 500;
    throw configurationError;
  }

  try {
    const response = await axios.post(`${JUDGE0_BASE_URL}/submissions`, submission, {
      params: { base64_encoded: 'false', wait: 'false' },
      headers: judge0Headers(),
      timeout: 15000
    });

    if (!response.data?.token) {
      throw new Error(response.data?.error || 'Judge0 did not return a submission token');
    }

    return response.data.token;
  } catch (error) {
    if (error.statusCode) throw error;
    throw getJudge0Error(error);
  }
};

const getSubmission = async (token) => {
  try {
    const response = await axios.get(`${JUDGE0_BASE_URL}/submissions/${token}`, {
      params: { base64_encoded: 'false', fields: '*' },
      headers: judge0Headers(),
      timeout: 15000
    });
    return response.data;
  } catch (error) {
    throw getJudge0Error(error);
  }
};

const waitForSubmission = async (token) => {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    const result = await getSubmission(token);
    if (result.status_id > 2) return result;
    await wait(POLL_INTERVAL_MS);
  }

  const timeoutError = new Error('Judge0 took too long to finish this submission. Please try again.');
  timeoutError.statusCode = 504;
  throw timeoutError;
};

// Judge0 batch endpoints are not available on every RapidAPI plan. Execute one
// test case at a time using the standard submission endpoint instead.
const executeSubmissions = async (submissions, { stopOnError = false } = {}) => {
  const results = [];

  for (const submission of submissions) {
    const token = await createSubmission(submission);
    const result = await waitForSubmission(token);
    results.push(result);

    // Compilation/runtime/platform errors cannot be fixed by another test case.
    if (stopOnError && result.status_id !== 3 && result.status_id !== 4) break;
  }

  return results;
};

module.exports = { getLanguageById, executeSubmissions };

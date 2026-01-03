// Base URL for the Interview App RESTful API
const API_BASE_URL = 'https://comp2140a2.uqcloud.net/api';

// JWT token for authorization, replace with your actual token HERE
const JWT_TOKEN = '';

// Your UQ student username, used for row-level security to retrieve your records
const USERNAME = '';

/**
 * Helper function to handle API requests. Reference from Week 5/6 Lecture
 * It sets the Authorization token and optionally includes the request body.
 * 
 * @param {string} endpoint - The API endpoint to call.
 * @param {string} [method='GET'] - The HTTP method to use (GET, POST, PATCH, DELETE).
 * @param {object} [body=null] - The request body to send, typically for POST or PATCH.
 * @param {object} [queryParams={}] - Query parameters for filtering, ordering, etc.
 * @returns {Promise<object>} - The JSON response from the API.
 * @throws Will throw an error if the HTTP response is OK.
 */
async function apiRequest(endpoint, method = 'GET', body = null, queryParams = {}) {
  // Build from query parameters
  const queryString = Object.keys(queryParams).length > 0 
    ? '?' + new URLSearchParams(queryParams).toString() 
    : '';
  
  const url = `${API_BASE_URL}${endpoint}${queryString}`;
  
  // establish options
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${JWT_TOKEN}`
    },
  };

  // If the method is POST or PATCH, we want the response to include the full representation
  if (method === 'POST' || method === 'PATCH') {
    options.headers['Prefer'] = 'return=representation';
  }

  // If a body is provided, add it to request and username
  if (body) {
    options.body = JSON.stringify({ ...body, username: USERNAME });
  }

  // Make the API request and check if the response is OK
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}, message: ${await response.text()}`);
  }
  
  // For DELETE requests with no content, return success message
  if (method === 'DELETE' && response.status === 204) {
    return { success: true, message: 'Resource deleted successfully' };
  }
  
  // Return as a JSON object
  return response.json();
}


// INTERVIEW ENDPOINTS
/**
 * Create a new interview
 * @param {object} interview - Interview data
 * @returns {Promise<object>} - Created interview object
 */
async function createInterview(interview) {
  return apiRequest('/interview', 'POST', interview);
}

/**
 * Get all interviews or filtered interviews
 * @param {object} [filters={}] - Query parameters for filtering
 * @returns {Promise<Array>} - Array of interview objects
 */
async function getInterviews(filters = {}) {
  return apiRequest('/interview', 'GET', null, filters);
}

/**
 * Get a single interview by ID
 * @param {string} id - Interview ID
 * @returns {Promise<object>} - Interview object
 */
async function getInterview(id) {
  return apiRequest('/interview', 'GET', null, { id: `eq.${id}` });
}

/**
 * Update an interview
 * @param {string} id - Interview ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} - Updated interview object
 */
async function updateInterview(id, updates) {
  console.log(id ,updates)
  return apiRequest('/interview', 'PATCH', updates, { id: `eq.${id}` });
}

/**
 * Delete an interview
 * @param {string} id - Interview ID
 * @returns {Promise<object>} - Success message
 */
async function deleteInterview(id) {
  return apiRequest('/interview', 'DELETE', null, { id: `eq.${id}` });
}


// QUESTION ENDPOINTS
/**
 * Create a new question
 * @param {object} question - Question data
 * @returns {Promise<object>} - Created question object
 */
async function createQuestion(question) {
  return apiRequest('/question', 'POST', question);
}

/**
 * Get a specific question by ID
 * @param {string} questionId - Question ID
 * @returns {Promise<Object>} - Question object
 */
async function getQuestion(questionId) {
  return apiRequest(`/question?id=eq.${questionId}`, 'GET');
}

/**
 * Get questions for a specific interview
 * @param {string} interviewId - Interview ID
 * @returns {Promise<Array>} - Array of question objects
 */
async function getQuestionsByInterview(interviewId) {
  return apiRequest('/question', 'GET', null, { interview_id: `eq.${interviewId}` });
}

/**
 * Update a question
 * @param {string} id - Question ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} - Updated question object
 */
async function updateQuestion(id, updates) {
  return apiRequest('/question', 'POST', updates, { id: `eq.${id}` });
}

/**
 * Delete a question
 * @param {string} id - Question ID
 * @returns {Promise<object>} - Success message
 */
async function deleteQuestion(id) {
  return apiRequest('/question', 'DELETE', null, { id: `eq.${id}` });
}

/**
 * Get question count for a specific interview
 * @param {string} interviewId - Interview ID
 * @returns {Promise<number>} - Count of questions
 */
async function getQuestionCount(interviewId) {
  try {
    const response = await fetch(`${API_BASE_URL}/question?interview_id=eq.${interviewId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Prefer': 'count=exact'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Get count from content-range header
    const contentRange = response.headers.get('content-range');
    const count = contentRange ? parseInt(contentRange.split('/')[1]) : 0;
    
    return count;
  } catch (error) {
    console.error('Error fetching question count:', error);
    return 0;
  }
}


// APPLICANT ENDPOINTS
/**
 * Create a new applicant
 * @param {object} applicant - Applicant data
 * @returns {Promise<object>} - Created applicant object
 */
async function createApplicant(applicant) {
  return apiRequest('/applicant', 'POST', applicant);
}

/**
 * Get a specific applicant by ID
 * @param {string} applicantId - Question ID
 * @returns {Promise<Object>} - Question object
 */
async function getApplicant(applicantId) {
  return apiRequest(`/applicant?id=eq.${applicantId}`, 'GET');
}

/**
 * Get applicants for a specific interview
 * @param {string} interviewId - Interview ID
 * @returns {Promise<Array>} - Array of applicant objects
 */
async function getApplicantsByInterview(interviewId) {
  return apiRequest('/applicant', 'GET', null, { interview_id: `eq.${interviewId}` });
}

/**
 * Update an applicant
 * @param {string} id - Applicant ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} - Updated applicant object
 */
async function updateApplicant(id, updates) {
  return apiRequest('/applicant', 'PATCH', updates, { id: `eq.${id}` });
}


// APPLICANT ANSWER ENDPOINTS
/**
 * Get answers for a specific applicant
 * @param {string} applicantId - Applicant ID
 * @returns {Promise<Array>} - Array of answer objects
 */
async function getAnswersByApplicant(applicantId) {
  return apiRequest('/applicant_answer', 'GET', null, { applicant_id: `eq.${applicantId}` });
}

/**
 * Get applicant count for a specific interview
 * @param {string} interviewId - Interview ID
 * @returns {Promise<number>} - Count of applicants
 */
async function getApplicantCount(interviewId) {
  try {
    const response = await fetch(`${API_BASE_URL}/applicant?interview_id=eq.${interviewId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Prefer': 'count=exact'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Get count from content-range header
    const contentRange = response.headers.get('content-range');
    const count = contentRange ? parseInt(contentRange.split('/')[1]) : 0;
    
    return count;
  } catch (error) {
    console.error('Error fetching applicant count:', error);
    return 0;
  }
}

/**
 * Submit an applicant's answer
 * @param {Object} answerData - Answer data
 * @returns {Promise<Object>} - Response from API
 */
async function submitApplicantAnswer(answerData) {
  return apiRequest('/applicant_answer', 'POST', answerData);
}

/**
 * Update applicant status
 * @param {string} applicantId - Applicant ID
 * @param {string} status - New status
 * @returns {Promise<Object>} - Updated applicant object
 */
async function updateApplicantStatus(applicantId, status) {
  return apiRequest(`/applicant?id=eq.${applicantId}`, 'PATCH', {
    interview_status: status
  });
}


// Export functions to use in other components
export {
  createInterview,
  getInterviews,
  getInterview,
  updateInterview,
  deleteInterview,
  createQuestion,
  getQuestion,
  getQuestionsByInterview,
  updateQuestion,
  deleteQuestion,
  getQuestionCount,
  createApplicant,
  getApplicant,
  getApplicantsByInterview,
  updateApplicant,
  getAnswersByApplicant,
  getApplicantCount,
  submitApplicantAnswer,
  updateApplicantStatus,
};

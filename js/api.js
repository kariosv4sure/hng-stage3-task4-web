// API Configuration
const API_BASE = "https://hng-stage3-task4-backend-production.up.railway.app/api/v1";

/**
 * Make GET request to API
 * @param {string} path - API endpoint path (e.g., "/auth/me")
 * @param {boolean} includeCredentials - Whether to include cookies (default: true)
 * @returns {Promise<any>} - Response data
 */
async function apiGet(path, includeCredentials = true) {
  const options = {
    method: "GET",
    headers: { 
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
  };
  
  // Only include credentials if requested (default true for authenticated requests)
  if (includeCredentials) {
    options.credentials = "include";
  }
  
  try {
    const res = await fetch(`${API_BASE}${path}`, options);

    if (!res.ok) {
      // If unauthorized, redirect to login
      if (res.status === 401) {
        console.warn("Unauthorized, redirecting to login...");
        window.location.href = "./index.html";
        return null;
      }
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error(`API GET Error (${path}):`, error);
    throw error;
  }
}

/**
 * Make POST request to API
 * @param {string} path - API endpoint path
 * @param {object} body - Request body
 * @param {boolean} includeCredentials - Whether to include cookies (default: true)
 * @returns {Promise<any>} - Response data
 */
async function apiPost(path, body = {}, includeCredentials = true) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(body),
  };
  
  if (includeCredentials) {
    options.credentials = "include";
  }
  
  try {
    const res = await fetch(`${API_BASE}${path}`, options);

    if (!res.ok) {
      if (res.status === 401) {
        console.warn("Unauthorized, redirecting to login...");
        window.location.href = "./index.html";
        return null;
      }
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error(`API POST Error (${path}):`, error);
    throw error;
  }
}

/**
 * Make PUT request to API
 * @param {string} path - API endpoint path
 * @param {object} body - Request body
 * @param {boolean} includeCredentials - Whether to include cookies (default: true)
 * @returns {Promise<any>} - Response data
 */
async function apiPut(path, body = {}, includeCredentials = true) {
  const options = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(body),
  };
  
  if (includeCredentials) {
    options.credentials = "include";
  }
  
  try {
    const res = await fetch(`${API_BASE}${path}`, options);

    if (!res.ok) {
      if (res.status === 401) {
        console.warn("Unauthorized, redirecting to login...");
        window.location.href = "./index.html";
        return null;
      }
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error(`API PUT Error (${path}):`, error);
    throw error;
  }
}

/**
 * Make DELETE request to API
 * @param {string} path - API endpoint path
 * @param {boolean} includeCredentials - Whether to include cookies (default: true)
 * @returns {Promise<any>} - Response data
 */
async function apiDelete(path, includeCredentials = true) {
  const options = {
    method: "DELETE",
    headers: { 
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
  };
  
  if (includeCredentials) {
    options.credentials = "include";
  }
  
  try {
    const res = await fetch(`${API_BASE}${path}`, options);

    if (!res.ok) {
      if (res.status === 401) {
        console.warn("Unauthorized, redirecting to login...");
        window.location.href = "./index.html";
        return null;
      }
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error(`API DELETE Error (${path}):`, error);
    throw error;
  }
}

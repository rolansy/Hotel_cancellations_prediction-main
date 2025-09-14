export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Get the path after /api
    const path = req.url?.replace('/api', '') || '';
    const backendUrl = `https://hotel-b-cancel-v1.onrender.com${path}`;
    
    console.log('Proxying to:', backendUrl);
    
    // Prepare headers
    const headers: Record<string, string> = {};
    
    // Handle form data for login
    if (req.headers['content-type']?.includes('multipart/form-data') || 
        req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
      headers['Content-Type'] = req.headers['content-type'];
    } else {
      headers['Content-Type'] = 'application/json';
    }
    
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }

    let body;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.headers['content-type']?.includes('multipart/form-data') || 
          req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
        body = req.body;
      } else {
        body = JSON.stringify(req.body);
      }
    }

    // Forward the request to the backend
    const response = await fetch(backendUrl, {
      method: req.method,
      headers,
      body,
    });

    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    // Return the response
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

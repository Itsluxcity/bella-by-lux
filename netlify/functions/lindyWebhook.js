// Store responses in memory (this will be cleared when the function is redeployed)
const responseStore = new Map();

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Log raw input for debugging
    console.log('Raw webhook input:', event.body);

    // Parse the incoming data
    let data;
    try {
      data = JSON.parse(event.body);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON payload' })
      };
    }

    // Log parsed data
    console.log('Parsed webhook data:', JSON.stringify(data, null, 2));

    // Extract response text from the data
    let responseText = '';
    
    if (typeof data === 'string') {
      responseText = data;
    } else if (data.text) {
      responseText = data.text;
    } else if (data.response) {
      if (typeof data.response === 'string') {
        responseText = data.response;
      } else if (data.response.text) {
        responseText = data.response.text;
      } else if (data.response.message) {
        responseText = data.response.message;
      }
    } else if (data.message) {
      responseText = data.message;
    }

    // If we found a response, return it
    if (responseText) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          text: responseText.trim()
        })
      };
    }

    // If we got here, we couldn't find a usable response
    console.log('No response text found in:', data);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'No response text found in payload'
      })
    };

  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error'
      })
    };
  }
};

// Function configuration
exports.config = {
  path: "/.netlify/functions/lindyWebhook",
  method: ["POST", "OPTIONS"]
}; 
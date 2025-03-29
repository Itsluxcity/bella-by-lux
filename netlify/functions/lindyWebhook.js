// Store responses in memory (this will be cleared when the function is redeployed)
const responseStore = new Map();

exports.handler = async function(event, context) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Method not allowed'
      })
    };
  }

  try {
    // Parse the incoming webhook data from Lindy
    let data;
    try {
      data = JSON.parse(event.body);
      console.log('Received webhook data:', JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error parsing webhook data:', error);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Invalid JSON payload'
        })
      };
    }

    // Extract the response text from various possible locations
    let responseText = '';
    if (data.response && typeof data.response === 'string') {
      responseText = data.response;
    } else if (data.response && data.response.text) {
      responseText = data.response.text;
    } else if (data.response && data.response.message) {
      responseText = data.response.message;
    } else if (data.text) {
      responseText = data.text;
    } else if (data.message) {
      responseText = data.message;
    }

    if (!responseText) {
      console.error('No response text found in webhook data');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'No response text found'
        })
      };
    }

    // Return the response text immediately
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        text: responseText
      })
    };
  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};

// Function configuration
exports.config = {
  path: "/.netlify/functions/lindyWebhook",
  method: ["POST", "OPTIONS"]
}; 
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
    // Log the raw body for debugging
    console.log('Raw webhook body:', event.body);

    // Try to parse as JSON first, if that fails treat as raw text
    let data;
    let responseText = '';
    
    try {
      data = JSON.parse(event.body);
      console.log('Parsed webhook data:', JSON.stringify(data, null, 2));
      
      // Extract response text from JSON structure
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
    } catch (parseError) {
      // If JSON parsing fails, use the raw body as the response text
      console.log('Not JSON, using raw text');
      responseText = event.body;
    }

    if (!responseText) {
      console.error('No response text found:', event.body);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'No response text found'
        })
      };
    }

    // Send back the response
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
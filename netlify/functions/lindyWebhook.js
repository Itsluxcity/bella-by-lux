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
    // Log the raw body for debugging
    console.log('Raw webhook body:', event.body);

    // Parse the incoming data
    let data;
    try {
      data = JSON.parse(event.body);
      console.log('Parsed webhook data:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.log('Not JSON, using raw text');
      data = { text: event.body };
    }

    // If this is a polling request (has messageId)
    if (data.messageId) {
      const storedResponse = responseStore.get(data.messageId);
      if (storedResponse) {
        // Clear the stored response after retrieving it
        responseStore.delete(data.messageId);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            text: storedResponse
          })
        };
      }
      return {
        statusCode: 202,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Response not ready'
        })
      };
    }

    // This is a webhook callback from Lindy
    let responseText = '';
    
    // Extract response text from various possible locations
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

    // Store the response if we have a messageId
    if (data.messageId) {
      responseStore.set(data.messageId, responseText);
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
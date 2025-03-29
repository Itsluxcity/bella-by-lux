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
    console.log('Raw webhook body:', event.body);

    // Try to parse as JSON, but don't fail if it's not JSON
    let data;
    try {
      data = JSON.parse(event.body);
      console.log('Parsed webhook data:', JSON.stringify(data, null, 2));
    } catch (e) {
      // If it's not JSON, use the raw text
      console.log('Not JSON, using raw text');
      data = { text: event.body };
    }

    // If this is a polling request from our frontend
    if (data.checkResponse === true && data.conversationId) {
      const storedResponse = responseStore.get(data.conversationId);
      if (storedResponse) {
        // Clear the stored response after returning it
        responseStore.delete(data.conversationId);
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
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'No response available yet'
        })
      };
    }

    // If this is a response from Lindy
    if (data.text && data.text !== 'MESSAGE RECIEVED') {
      // Store the response if we have a conversation ID
      if (data.conversationId) {
        responseStore.set(data.conversationId, data.text);
        console.log('Stored response for conversation:', data.conversationId);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          text: data.text
        })
      };
    }

    // If we got here, it's probably just an acknowledgment
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Acknowledgment received'
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
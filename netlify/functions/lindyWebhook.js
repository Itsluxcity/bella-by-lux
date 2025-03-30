// Store responses in memory (this will be cleared when the function is redeployed)
const responseStore = new Map();

exports.handler = async function(event, context) {
  // Log everything about the request
  console.log('Request Method:', event.httpMethod);
  console.log('Request Headers:', JSON.stringify(event.headers, null, 2));
  console.log('Raw Body:', event.body);
  console.log('Query Parameters:', event.queryStringParameters);

  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  try {
    // Try to parse JSON
    let responseData;
    try {
      responseData = JSON.parse(event.body);
      console.log('Parsed JSON:', JSON.stringify(responseData, null, 2));
    } catch (e) {
      // Not JSON, use raw text
      responseData = { text: event.body };
      console.log('Using raw text:', event.body);
    }

    // If this is a response from Lindy (not an acknowledgment)
    if (responseData.text && responseData.text !== 'MESSAGE RECIEVED') {
      // Send the response to the frontend
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          text: responseData.text
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
    console.error('Error:', error);
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
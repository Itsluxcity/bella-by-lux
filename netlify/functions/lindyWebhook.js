// Store responses in memory (this will be cleared when the function is redeployed)
const responseStore = new Map();

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  // Handle GET requests for SSE
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: 'data: connected\n\n'
    };
  }

  // Only allow POST requests for webhook
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
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

    // If this is a response from Lindy (not an acknowledgment)
    if (data.text && data.text !== 'MESSAGE RECIEVED') {
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'text/event-stream' },
        body: `data: ${JSON.stringify({
          success: true,
          text: data.text
        })}\n\n`
      };
    }

    // If we got here, it's probably just an acknowledgment
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Acknowledgment received'
      })
    };

  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
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
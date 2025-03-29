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
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the incoming webhook data
    let data;
    
    // First try to parse the body as JSON
    try {
      data = JSON.parse(event.body);
    } catch (parseError) {
      // If JSON parsing fails, try to escape special characters
      const escapedBody = event.body
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
      
      try {
        data = JSON.parse(`{"text": "${escapedBody}"}`);
      } catch (secondError) {
        // If both parsing attempts fail, return the raw body as text
        data = { text: event.body };
      }
    }

    console.log('Received webhook data:', JSON.stringify(data, null, 2));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Webhook received successfully',
        data: {
          text: typeof data.text === 'string' ? data.text : 'Message received',
          processed: true
        }
      })
    };
  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 200, // Changed to 200 to avoid Lindy retries
      headers,
      body: JSON.stringify({
        message: 'Webhook processed with warnings',
        data: {
          text: 'I received your message but had trouble processing it. Could you try rephrasing?',
          error: error.message
        }
      })
    };
  }
}; 
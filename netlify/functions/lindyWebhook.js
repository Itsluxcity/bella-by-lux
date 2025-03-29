exports.handler = async function(event, context) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
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
    const data = JSON.parse(event.body);
    console.log('Received webhook data:', JSON.stringify(data, null, 2));

    // Here you can process the webhook data as needed
    // For now, we'll just log it and return success

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Webhook received successfully',
        data: data
      })
    };
  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'Invalid request data',
        details: error.message
      })
    };
  }
}; 
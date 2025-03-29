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
    try {
      data = JSON.parse(event.body);
      console.log('Received webhook data:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error('Error parsing webhook data:', parseError);
      data = { text: event.body };
    }

    // Extract the response text from the webhook data
    let responseText = '';
    if (data.text) {
      responseText = data.text;
    } else if (data.data && data.data.text) {
      responseText = data.data.text;
    } else if (data.message) {
      responseText = data.message;
    }

    // Send back the response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        text: responseText || "I received your message!",
        data: data
      })
    };
  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        text: "I'm having trouble understanding. Could you try again?",
        error: error.message
      })
    };
  }
}; 
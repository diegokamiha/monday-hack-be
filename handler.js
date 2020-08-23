'use strict';

// Imports the Dialogflow library
const dialogflow = require('@google-cloud/dialogflow');

// Instantiates a session client
const sessionClient = new dialogflow.SessionsClient();

module.exports.hello = async event => {
  try {
    var req = JSON.parse(event.body);
    var res = await detectIntent(req.text)
    return done(200, res)
  } catch (error) {
    return done(500, null, null, error)
  }
};

async function detectIntent(query) {
  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClient.projectAgentSessionPath(
    "mondayhackathon-qlor",
    "123456789"
  );

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: "en-US",
      },
    },
  };

  const responses = await sessionClient.detectIntent(request);
  return responses[0];
}

function done(statusCode, payload, extraHeaders, err) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Credentials": true,
    "access-control-allow-methods": "GET,POST,OPTIONS,PUT,DELETE"
  }

  // Copies extra headers to header object
  if (extraHeaders) {
    for (var key in extraHeaders) {
      headers[key] = extraHeaders[key]
    }
  }

  var responseModel = {}

  if (err) {
    // Default statusCode for error is 500
    statusCode = err.statusCode ? err.statusCode : 500
    responseModel.error = {
      message: err.message,
      description: err.description
    }
  } else if (payload) {
    responseModel = payload
  }

  return {
    statusCode: statusCode,
    headers: headers,
    body: JSON.stringify(responseModel)
  }
}

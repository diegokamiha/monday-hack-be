'use strict';

// Imports the Dialogflow library
const dialogflow = require('@google-cloud/dialogflow');

// Instantiates a session client
const sessionClient = new dialogflow.SessionsClient();

module.exports.hello = async event => {
  var req = JSON.parse(event.body);
  console.log(req)

  var res = await detectIntent(req.text)

  console.log(res)

  return {
    statusCode: 200,
    body: JSON.stringify(res),
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Credentials": true,
      "access-control-allow-methods": "GET,POST,OPTIONS,PUT,DELETE"
    }
  };
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

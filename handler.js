'use strict';

// Imports the Dialogflow library
const dialogflow = require('@google-cloud/dialogflow');

var multipart = require('parse-multipart')

const toWav = require('audiobuffer-to-wav')


// Instantiates a session client
const sessionClient = new dialogflow.SessionsClient();

module.exports.hello = async event => {
  try {
    console.log("Event: ", JSON.stringify(event, null, 2))

    if (event.headers && (event.headers["Content-Type"] || event.headers["content-type"])) {
      var contentType = event.headers["Content-Type"] || event.headers["content-type"]
    } else {
      return done(400, null, null, new Error("Missing content-type"))
    }

    if (contentType.match("multipart/form-data")) {

      var bodyBuffer = Buffer.from(event.body, 'base64')

      var parts = multipart.Parse(bodyBuffer, multipart.getBoundary(contentType));

      var res = await detectAudioIntent(parts[0].data)

      console.log(JSON.stringify(res, null, 2))

    } else {

      var req = JSON.parse(event.body);
      var res = await detectIntent(req.text)
    }

    return done(200, res)
  } catch (error) {
    console.log(error)
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

async function detectAudioIntent(inputAudio) {

  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClient.projectAgentSessionPath(
    "mondayhackathon-qlor",
    "123456789"
  );

  // var wav = await decode(inputAudio)

  // The audio query request.
  const request = {
    session: sessionPath,
    queryInput: {
      audioConfig: {
        audioEncoding: 'AUDIO_ENCODING_LINEAR_16',
        languageCode: "en",
      },
    },
    inputAudio: inputAudio.toString("base64"),
  };

  const responses = await sessionClient.detectIntent(request);
  return responses;
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

function decode(buffer) {
  return new Promise ((resolve, reject) => {

    var context = new AudioContext()
    context.decodeAudioData(buffer, function (res) {
      // encode AudioBuffer to WAV
      var wav = toWav(res)

      // do something with the WAV ArrayBuffer ...
      return wav
    })
  })
}

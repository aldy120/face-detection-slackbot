'use strict';
const request = require('request')
const fs = require('fs')
const { WebClient } = require('@slack/client')
const token = process.env.ACCESS_TOKEN
const web = new WebClient(token)
const AWS = require('aws-sdk')
const rekognition = new AWS.Rekognition();



module.exports.event = (event, context, callback) => {
  const body = event.body && JSON.parse(event.body)

  // verfied event api challnege token
  if (isChallenge(body)) {
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        challenge: body.challenge
      })
    }

    callback(null, response)
    return
  }

  //process channel message
  let text = body.event.text
  const conversationId = body.event.channel

  // console.log(body)

  // do not response a bot
  if (isBot(body)) {
    console.log({info: 'This is a bot message which do not be replied'})
    callback(null, {
      statusCode: 200
    });

    return 
  }

  // console.log(event)
  // if the file upload
  if (isFileUpload(body)) {
    const imageUrl = body.event.file.url_private
    console.log({imageUrl})
    console.log('Start download image')
    downloadImage(imageUrl)
      .then(recognition)
      .then(data => sendToChannel(conversationId, JSON.stringify(data, null, 2)))
  }
  
  // send message
  // sendToChannel(conversationId, text)

  callback(null, {
    statusCode: 200
  });
}

function sendToChannel(conversationId, text) {
  console.log({conversationId, text})

  web.chat.postMessage({
    text: text,
    channel: conversationId
  }).then((res) => {
    console.log('Message sent: ', res.ts)
    console.log({res})
  }).catch(console.error)
}

function recognition(img) {
  const params = {
    Image: { /* required */
      Bytes: img
    }
  }

  return new Promise((resolve, reject) => {
    rekognition.detectFaces(params, function(err, data) {
      if (err) {
        console.log({err})
        reject(err)
        return
      }
  
      resolve(data)
    })
  })
}

function isFileUpload(body) {
  return body.event.type === 'message' && body.event.subtype === 'file_share';
}

function downloadImage(url) {
  return new Promise((resolve) => {
    request.get(url, {
      encoding: null,
      auth: {
        bearer: token
      }
    }, (err, httpResponse, body) => {
      if (err) {
        console.log(err)
        return
      }
  
      // this body is image (buffer)
      resolve(body)
    })
  })
}

function isBot(body) {
  return !!body.event.bot_id
}

function isChallenge(body) {
  return body && body.type === 'url_verification'
}
'use strict';
const request = require('request')
const fs = require('fs')
const { WebClient } = require('@slack/client')
const token = process.env.ACCESS_TOKEN
const web = new WebClient(token)

function isBot(body) {
  return !!body.event.bot_id
}

function isChallenge(body) {
  return body && body.type === 'url_verification'
}

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
  const text = body.event.text
  const conversationId = body.event.channel

  console.log(body)

  // if the file upload
  if (isFileUpload(body)) {
    const imageUrl = body.event.file.url_private
    console.log({imageUrl})
    console.log('Start download image')
    downloadImage(imageUrl)
  }
  

  // do not response a bot
  if (isBot(body)) {
    console.log({info: 'This is a bot message which do not be replied'})
    callback(null, {
      statusCode: 200
    });
    return 
  }

  web.chat.postMessage({
    text: text,
    channel: conversationId
  }).then((res) => {
    console.log('Message sent: ', res.ts)
    console.log(res)
  }).catch(console.error)

  callback(null, {
    statusCode: 200
  });
}

function isFileUpload(body) {
  return body.event.type === 'message' && body.event.subtype === 'file_share';
}

function downloadImage(url) {
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

    // this body is image buffer
    console.log({isBuffer: body.constructor === Buffer})
  })
}
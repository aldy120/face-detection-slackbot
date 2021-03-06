'use strict';
const request = require('request')
const { WebClient } = require('@slack/client')
const token = process.env.ACCESS_TOKEN
const web = new WebClient(token)
const AWS = require('aws-sdk')
const rekognition = new AWS.Rekognition();
const lambda = new AWS.Lambda();

const processImage = require('./processImage')

module.exports.dispatcher = dispatcher
module.exports.event = event

function dispatcher (event, context, callback) {
  const body = event.body && JSON.parse(event.body)
  // Verfied event api challnege token
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

  // Invoke event handler: another lambda function
  var params = {
    ClientContext: "dispatcher", 
    FunctionName: process.env.REPLY_FUNCTION_NAME, 
    InvocationType: "Event", 

    Payload: eventToBuffer(event), 
  };

  lambda.invoke(params, function(err, data) {
    if (err) {
      console.log(err, err.stack); // an error occurred
    } else {
      console.log({data});           // successful response
    }
  });

  // return 200 ASAP
  callback(null, {
    statusCode: 200
  });
}


function event(event, context, callback) {
  const body = event.body && JSON.parse(event.body)
  
  //process channel message
  let text = body.event.text
  const conversationId = body.event.channel
  const introduction = '這是一個分析圖片中人物的 channel 。你可以上傳圖片試試看。'


  // do not response a bot
  if (isBot(body)) {
    console.log({info: 'This is a bot message which do not be replied'})
    callback(null, {
      statusCode: 200
    });

    return 
  }

  // if the file upload
  // todo: file upload does not equal image

  // 如果判斷是是真人在上傳照片
  if (isFileUpload(body)) {
    const imageUrl = body.event.file.url_private
    downloadImage(imageUrl)
      .then(recognition)
      .then(({data, img}) => {
        sendToChannel(conversationId, JSON.stringify(data, null, 2))
        return {data, img}
      }).then(processImage)
      .then((buf) => {
        console.log('before upload')
        uploadImage(conversationId, buf)
      })
      .catch(err => console.log(err))
  } else {
    sendToChannel(conversationId, introduction)
  }

  callback(null, {
    statusCode: 200
  });
}

function eventToBuffer(event) {
  return Buffer.from(JSON.stringify(event))
}

function uploadImage(conversationId, fileStream) {
  // console.log({conversationId, fileStream})
  // console.log(fileStream)
  // console.log(fs.createReadStream("./ma19.jpg"))
  const filename = 'output.png'
  return web.files.upload({
    filename,
    channels: conversationId,
    file: fileStream,
    // content: 'hello'
    // file: fs.createReadStream('./kp.png'),
    // file: fs.createReadStream('./output.png'),
    // filetype: 'png',
  }).then((res) => {
    console.log({res})
  }).catch(console.error)
}

function sendToChannel(conversationId, text) {
  web.chat.postMessage({
    text: text,
    channel: conversationId
  }).then((res) => {
    console.log('Message sent: ', res.ts)
    // console.log({res})
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
      
      const payload = {
        data,
        img
      }
      resolve(payload)
    })
  })
}

function isFileUpload(body) {
  return body.event.type === 'message' && 
    body.event.subtype === 'file_share' &&
    (
      body.event.file.mimetype === 'image/png' ||
      body.event.file.mimetype === 'image/jpeg'
    )
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
  return (
    body.event.subtype === 'bot_message' || 
    body.event.user === 'UB7JZ1XQ9'
  )
}

function isChallenge(body) {
  return body && body.type === 'url_verification'
}


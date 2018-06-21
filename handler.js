'use strict';
const request = require('request')
const fs = require('fs')
const { WebClient } = require('@slack/client')
const token = process.env.ACCESS_TOKEN
const web = new WebClient(token)
const AWS = require('aws-sdk')
const rekognition = new AWS.Rekognition();
const lambda = new AWS.Lambda();

const processImage = require('./processImage')
const bufferToStream = require('./bufferToStream')

module.exports.dispatcher = (event, context, callback) => {
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

  var params = {
    ClientContext: "dispatcher", 
    FunctionName: process.env.REPLY_FUNCTION_NAME, 
    InvocationType: "Event", 

    Payload: eventToBuffer(event), 
  };
  // console.log(params)
  lambda.invoke(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log({data});           // successful response
    /*
    data = {
    FunctionError: "", 
    LogResult: "", 
    Payload: <Binary String>, 
    StatusCode: 123
    }
    */
  });

  callback(null, {
    statusCode: 200
  });
}


module.exports.event = (event, context, callback) => {
  // console.log('hi')
  const body = event.body && JSON.parse(event.body)
  
  //process channel message
  let text = body.event.text
  const conversationId = body.event.channel
  const introduction = '這是一個分析圖片中人物的 channel 。你可以上傳圖片試試看。'

  // console.log(body)

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
  // sendToChannel(conversationId, '這是一個分析圖片中人物的 channel 。你可以上傳圖片試試看。')
  // uploadImage(conversationId, fs.createReadStream('./kp.png'))
  console.log(body)
  // send && uploadImage(conversationId, fs.createReadStream('./kp.png'))
  // send = false
  
  

  // 如果判斷是是真人在上傳照片
  if (isFileUpload(body)) {
    const imageUrl = body.event.file.url_private
    console.log({imageUrl})
    downloadImage(imageUrl)
      .then(recognition)
      .then(({data, img}) => {
        sendToChannel(conversationId, JSON.stringify(data, null, 2))
        // console.log({data: typeof data, img})
        return {data, img}
      }).then(processImage)
      // .then(bufferToStream)
      .then((buf) => {
        // var ws = fs.createWriteStream('output.png')
        // stream.pipe(ws)
        console.log('before upload')
        uploadImage(conversationId, buf)
      })
      .catch(err => console.log(err))
  } else {
    // send message
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
  return (
    body.event.subtype === 'bot_message' || 
    body.event.user === 'UB7JZ1XQ9'
  )
}

function isChallenge(body) {
  return body && body.type === 'url_verification'
}


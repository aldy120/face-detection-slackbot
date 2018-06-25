const { createCanvas, loadImage, Image } = require('canvas')
const fs = require('fs')

// data: description of image from rekognition
// img: Buffer
function processImage({data, img}) {
  const image = new Image
  image.src = img
  const canvas = createCanvas(image.width, image.height)
  const ctx = canvas.getContext('2d')

  ctx.drawImage(image, 0, 0)

  // draw bounding boxes
  const boxes = data.FaceDetails.map(face => face.BoundingBox)
  boxes.forEach(box => drawRectangle(box, image, ctx))
  

  // 原本是 toBuffer ，並回傳 buffer
  // const stream = canvas.createPNGStream()
  const buf = canvas.toBuffer()
  // console.log(buf)
  return buf
}

function drawRectangle(box, image, ctx) {
  const left = box.Left * image.width
  const width = box.Width * image.width
  
  const top = box.Top * image.height
  const height = box.Height * image.height

  ctx.rect(left, top, width, height)
  ctx.stroke()
}

module.exports = processImage
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
  boxes.forEach((box, i) => {
    drawRectangle(box, image, ctx)
    drawText(i, box, image, ctx)
  })

  const buf = canvas.toBuffer()
  return buf
}

function drawText(text, box, image, ctx) {
  const {left, top, width, height} = getPixelBoundingBox(box, image)
  ctx.font = "30px Arial"
  ctx.fillText(text.toString(), left, top);
}

function drawRectangle(box, image, ctx) {
  const {left, top, width, height} = getPixelBoundingBox(box, image)
  
  ctx.rect(left, top, width, height)
  ctx.stroke()
}

function getPixelBoundingBox(box, image) {
  const left = box.Left * image.width
  const width = box.Width * image.width
  
  const top = box.Top * image.height
  const height = box.Height * image.height

  return {left, top, width, height}
}

module.exports = processImage
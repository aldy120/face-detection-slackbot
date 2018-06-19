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
  const buf = canvas.toBuffer()
  // console.log(buf)
  return buf
}

module.exports = processImage
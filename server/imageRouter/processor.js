import resizer, { resize } from './resizer'
import serverConfig from '../server.config.js'
import S3FS from 's3fs'

const s3Fs = new S3FS(serverConfig.bucket, {
  region: 'eu-west-1',
})

function checkForOriginal(filePath) {
  return new Promise((resolve, reject) => {
    s3Fs.exists(filePath, exists => {
      if (exists) {
        resolve(filePath)
      } else {
        reject('File not found')
      }
    })
  })
}

const resizeQueue = []
let runningQueue = false

function processResizeQueue(item) {
  runningQueue = true
  resize(item.options).then(result => {
    item.resolve(result)
    if (resizeQueue.length) processResizeQueue(resizeQueue.pop())
    else runningQueue = false
  }).catch(reason => {
    item.reject(reason)
    if (resizeQueue.length) processResizeQueue(resizeQueue.pop())
    else runningQueue = false
  })
}

function resizeImage(options) {
  return new Promise((resolve, reject) => {
    s3Fs.mkdirp(`/${options.name}/${options.extension}/${options.width}/${options.height}`)
    .then(() => {
      resizeQueue.push({
        options,
        resolve,
        reject,
      })
      if (!runningQueue) processResizeQueue(resizeQueue.pop())
    })
    .catch(reject)
  })
}

function addImage(stream) {
  return new Promise((resolve, reject) => {
    let bits = stream.split('.')
    const extension = bits[bits.length - 1]
    bits = stream.split(serverConfig.origin)
    let name = bits[bits.length - 1]
    name = name.substr(0, name.lastIndexOf('.'))
    const config = {
      stream,
      name,
      extension,
      width: 1200,
      height: 1200,
    }
    s3Fs.mkdirp(`/${name}/${extension}/1200/1200`)
    .then(() => {
      resizer(config)
      .then(resolve)
      .catch((reason) => {
        s3Fs.unlink(`/${name}/**`)
        reject(reason)
      })
    })
    .catch(reject)
  })
}

function resolveImageRequest(req) {
  return new Promise((resolveImage, rejectImage) => {
    const bits = req.params.name.split('.')
    const name = bits[0]
    const ext = bits[1]
    const types = ['jpg', 'gif', 'png']
    if (bits.length !== 2 || types.indexOf(ext) === -1) return rejectImage('Unsupported filetype')
    const imagePath = `/${name}/${ext}/${req.params.width}/${req.params.height}/${req.params.name}`
    const originalPath = `/${name}/${name}.${ext}`
    return s3Fs.exists(imagePath, exists => {
      if (exists) {
        s3Fs.readFile(imagePath)
        .then(data => {
          resolveImage(Object.assign({}, data, { name, ext }))
        })
      } else {
        checkForOriginal(originalPath)
        .then(success => {
          resizeImage({
            stream: success,
            name,
            extension: ext,
            width: parseInt(req.params.width, 10),
            height: parseInt(req.params.height, 10),
          }).then(() => {
            s3Fs.readFile(imagePath)
            .then(data => {
              resolveImage(Object.assign({}, data, { name, ext }))
            })
          }).catch(reason => {
            rejectImage(reason)
          })
        }).catch(() => {
          const stream = `${serverConfig.origin}${req.params.name}`
          addImage(stream)
          .then(() => {
            // now we have an image run the request again
            resolveImageRequest(req)
            .then(resolveImage)
            .catch(rejectImage)
          })
          .catch(rejectImage)
        })
      }
    })
  })
}

export {
  addImage,
  checkForOriginal,
  resizeImage,
  resolveImageRequest,
}

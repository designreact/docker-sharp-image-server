import sharp from 'sharp'
import request from 'request'
import serverConfig from '../server.config.js'
import S3FS from 's3fs'

const s3Fs = new S3FS(serverConfig.bucket, {
  region: 'eu-west-1',
})

// reduce memory requirement by disabling cache (better for small/tiny instances)
sharp.cache(false)

function download(uri, filePath) {
  return new Promise((resolve, reject) => {
    request({
      method: 'GET',
      uri,
    }
    , (nsErr, response, body) => {
      if (nsErr) {
        reject(nsErr)
        return
      }
      const data = JSON.parse(body)
      if (data.url && data.url.length) {
        const writeStream = s3Fs.createWriteStream(filePath)
        request(`${serverConfig.nsRoot}${data.url}`)
        .pipe(writeStream)
        /*
         * BEGIN PIPE ON CLOSE HACK
         * FIXME pipe.on close not being called. Dirty timeout hack below.
         */
        let count = 0
        function checkImage() {
          s3Fs.readFile(filePath)
          .then(() => {
            resolve(filePath)
          })
          .catch(() => {
            count ++
            if (count < 20) setTimeout(checkImage, 250)
            else {
              console.log(Date(), filePath, 'Image not saved to s3')
              reject('Image not saved')
            }
          })
        }
        setTimeout(checkImage, 1000)
        /*
         * END PIPE ON CLOSE HACK
         */
      } else {
        console.log(Date(), filePath, 'Image url not supplied by ns')
        reject('Image url not supplied by ns')
      }
    })
  })
}

function processImage(config, data) {
  return new Promise((resolve, reject) => {
    sharp(data.Body)
    .resize(config.width, config.height)
    .toBuffer()
    .then(resolve)
    .catch(reject)
  })
}

function resize(config) {
  return new Promise((resolve, reject) => {
    const url = `/${config.name}/${config.extension}/${config.width}/${config.height}/${config.name}.${config.extension}`
    s3Fs.readFile(config.stream)
    .then(data => {
      return processImage(config, data)
    })
    .then(data => {
      return s3Fs.writeFile(url, data)
    })
    .then(() => {
      resolve({ url })
    })
    .catch(reason => {
      console.log(Date(), 'failed', reason)
      reject(reason)
    })
  })
}

function fetchAndResize(config) {
  return new Promise((resolve, reject) => {
    const url = `/${config.name}/${config.extension}/${config.width}/${config.height}/${config.name}.${config.extension}`
    download(config.stream, `/${config.name}/${config.name}.${config.extension}`)
    .then(filePath => {
      return s3Fs.readFile(filePath)
    })
    .then(data => {
      return processImage(config, data)
    })
    .then(data => {
      return s3Fs.writeFile(url, data)
    })
    .then(() => {
      resolve({ url })
    })
    .catch(reason => {
      console.log(Date(), 'failed', reason)
      reject(reason)
    })
  })
}

export { resize }
export default fetchAndResize

/*
* export methods for test
*/
export const __test__ = { download }

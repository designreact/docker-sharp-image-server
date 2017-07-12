import express from 'express'
import bodyParser from 'body-parser'
import { resolveImageRequest } from './processor'

function resolveRequest(req, res) {
  resolveImageRequest(req)
  .then(data => {
    switch (data.ext) {
      case 'gif':
        res.contentType('image/gif')
        break
      case 'png':
        res.contentType('image/png')
        break
      default:
        res.contentType('image/jpeg')
    }
    res.status(200).send(data.Body)
  })
  .catch((reason) => {
    res.status(404).send(reason)
  })
}

const imageRouter = express()
imageRouter.use(bodyParser.json())

// TODO add method to invalidate / delete an image from cache
imageRouter.get('/:width/:height/:name', resolveRequest)

imageRouter.use((req, res) => {
  res.status(405).send({
    status: 'error',
    message: 'Method not allowed',
  })
})

export default imageRouter

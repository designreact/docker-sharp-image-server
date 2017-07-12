delete process.env.BROWSER

import express from 'express'
import imageRouter from './imageRouter'
import serverConfig from './server.config.js'

const app = express()

app.get('/robots.txt', (req, res) => {
  res.type('text/plain')
  res.send('User-agent: *\nDisallow: /')
})
app.use('/', imageRouter)

app.listen(serverConfig.port)

export default app

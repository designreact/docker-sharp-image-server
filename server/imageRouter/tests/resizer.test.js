import expect from 'expect'
import sinon from 'sinon'
/* eslint no-unused-vars:off */
import sinonaspromised from 'sinon-as-promised'
/* eslint quote-props:off */
import proxyquire from 'proxyquire'

import nock from 'nock'
import fs from 'fs'
import mock from 'mock-fs'

function returnsPromise(promise) {
  return typeof promise().then === 'function'
}

describe('Given the sharpAdaptor processor', () => {
  let sandbox
  let sharpAdaptor
  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    sharpAdaptor = proxyquire('../sharpAdaptor', {
      'sharp': function(stream) {
        return {
          resize() {
            return this
          },
          toFile(url, callback) {
            callback(sandbox.toFileError, sandbox.toFileInfo)
            return this
          },
        }
      },
    })
  })
  afterEach(() => {
    sandbox.restore()
  })
  describe('Given the download function', () => {
    it('Should return a promise', () => {
      expect(returnsPromise(sharpAdaptor.__test__.download)).toBe(true)
    })
    it('Should reject with the expected error', (done) => {
      sandbox.nock = nock('http://somefile.com')
      sandbox.nock.head('/image.jpg').replyWithError('An Error')
      sharpAdaptor.__test__.download('http://somefile.com/image.jpg', 'filepath').then(() => {
        expect(false).toBe(true)
        done()
      }).catch(err => {
        console.log(Date(), err)
        expect(err.toString()).toBe('Image not found')
        done()
      })
    })
    /* TODO figure how the hell to mock request event and fs */
    xit('Should resolve with the expected filepath', (done) => {
      sandbox.nock = nock('http://somefile.com')
      sandbox.nock.head('/image.jpg').reply(200)
      sandbox.nock.get('/image.jpg').reply(200, (uri, requestBody) => {
        return fs.createReadStream(`${__dirname}../../../mock/small.gif`)
      })
      sandbox.mock = mock({
        expected: {
          filepath: {},
        },
      })
      sharpAdaptor.__test__.download('http://somefile.com/image.jpg', 'expected/filepath').then((filePath) => {
        expect(filePath).toBe('Expected Filepath')
        done()
      }).catch(() => {
        expect(false).toBe(true)
        done()
      })
    })
  })

  describe('Given the resize function', () => {
    it('Should return a promise', () => {
      expect(returnsPromise(sharpAdaptor.resize)).toBe(true)
    })
    it('Should reject with the expected error', (done) => {
      sandbox.toFileError = 'Expected Error'
      sharpAdaptor.resize({
        stream: 'teststream',
        filepath: 'test/path/',
        name: 'testfile',
        extension: 'jpg',
        width: 200,
        height: 200,
      }).then(() => {
        expect(false).toBe(true)
        done()
      }).catch((error) => {
        expect(error).toBe('Expected Error')
        done()
      })
    })
    xit('Should resolve with the expected url', (done) => {
      sandbox.toFileInfo = {}
      sharpAdaptor.resize({
        stream: 'teststream',
        filepath: 'test/path/',
        name: 'testfile',
        extension: 'jpg',
        width: 200,
        height: 200,
      }).then((info) => {
        expect(info.url).toBe('test/path/testfile/jpg/200/200/testfile.jpg')
        done()
      }).catch((error) => {
        expect(false).toBe(true)
        done()
      })
    })
  })

  describe('Given the fetchAndResize function', () => {
    it('Should return a promise', () => {
      expect(returnsPromise(sharpAdaptor.default)).toBe(true)
    })
    /* TODO Figure out how to stub download in sharpAdaptor */
    xit('Should reject with the expected error', (done) => {
      sandbox.toFileError = 'Expected Error'
      sharpAdaptor.__test__.download = null
      sharpAdaptor.default({
        stream: 'teststream',
        filepath: 'test/path/',
        name: 'testfile',
        extension: 'jpg',
        width: 200,
        height: 200,
      }).then(() => {
        expect(false).toBe(true)
        done()
      }).catch((error) => {
        expect(error).toBe('Expected Error')
        done()
      })
    })
    /* TODO Figure out how to stub download in sharpAdaptor */
    xit('Should resolve with the expected error', () => {
      expect(false).toBe(true)
    })
  })
})

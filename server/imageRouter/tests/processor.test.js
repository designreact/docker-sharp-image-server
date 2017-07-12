import expect from 'expect'
import sinon from 'sinon'
/* eslint no-unused-vars:off */
import sinonaspromised from 'sinon-as-promised'
/* eslint quote-props:off */
// import proxyquire from 'proxyquire'
const proxyquire = require('proxyquire').noCallThru()

function returnsPromise(promise) {
  return typeof promise().then === 'function'
}

describe('Given the imageRouter processor', () => {
  let sandbox
  let processor
  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    sandbox.adaptorStub = sinon.stub()
    sandbox.pathJoinStub = sinon.stub()
    processor = proxyquire('../processor', {
      'path': {
        join: sandbox.pathJoinStub,
      },
      'fs-access': (path, callback) => {
        callback(sandbox.fsAccessError)
      },
      'mkdirp': (url, callback) => {
        callback(sandbox.mkdirpError)
      },
      './sharpAdaptor': sandbox.adaptorStub,
    })
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('Given the checkForOriginal function', () => {
    it('Should return a promise', () => {
      expect(returnsPromise(processor.checkForOriginal)).toBe(true)
    })
    it('Should reject with the expected error', (done) => {
      sandbox.fsAccessError = 'Expected Error'
      processor.checkForOriginal('filepath').then(() => {
        expect(false).toBe(true)
        done()
      }).catch((err) => {
        expect(err).toBe('Expected Error')
        done()
      })
    })
    it('Should resolve with the expected file path', (done) => {
      processor.checkForOriginal('Expected filepath').then((path) => {
        expect(path).toBe('Expected filepath')
        done()
      }).catch((err) => {
        expect(false).toBe(true)
        done()
      })
    })
  })

  describe('Given the resizeImage function', () => {
    it('Should return a promise', () => {
      expect(returnsPromise(processor.resizeImage)).toBe(true)
    })
    describe('Given the mkdirp is NOT successful', () => {
      it('Should reject with the expected reason', (done) => {
        sandbox.mkdirpError = 'Expected MKDIRP Error'
        processor.resizeImage({}).then(() => {
          expect(false).toBe(true)
          done()
        }).catch((err) => {
          expect(err).toBe('Expected MKDIRP Error')
          done()
        })
      })
    })
    describe('Given the mkdirp is successful', () => {
      beforeEach(() => {
        sandbox.resizeStub = sinon.stub()
        sandbox.adaptorStub = {
          resize: sandbox.resizeStub,
        }
        processor = proxyquire('../processor', {
          'path': {
            join: sandbox.pathJoinStub,
          },
          'fs-access': (path, callback) => {
            callback(sandbox.fsAccessError)
          },
          'mkdirp': (url, callback) => {
            callback(sandbox.mkdirpError)
          },
          './sharpAdaptor': sandbox.adaptorStub,
        })
      })
      it('Should reject with the expected reason', (done) => {
        sandbox.resizeStub.rejects('Expected Error')
        processor.resizeImage({}).then(() => {
          expect(false).toBe(true)
          done()
        }).catch((err) => {
          expect(err.toString()).toBe('Error: Expected Error')
          done()
        })
      })
      it('Should resolve with the expected result', (done) => {
        sandbox.resizeStub.resolves('Expected Result')
        processor.resizeImage({}).then((result) => {
          expect(result).toBe('Expected Result')
          done()
        }).catch((err) => {
          expect(false).toBe(true)
          done()
        })
      })
    })
  })

  describe('Given the addProductImage function', () => {
    it('Should return a promise', () => {
      expect(returnsPromise(processor.addProductImage)).toBe(true)
    })
    describe('Given the mkdirp is NOT successful', () => {
      it('Should reject with the expected reason', (done) => {
        sandbox.mkdirpError = 'Expected MKDIRP Error'
        processor.addProductImage('stream url').then(() => {
          expect(false).toBe(true)
          done()
        }).catch((err) => {
          expect(err).toBe('Expected MKDIRP Error')
          done()
        })
      })
    })
    xdescribe('Given the mkdirp is successful', () => {
      beforeEach(() => {
        sandbox.processImageStub = sinon.stub(processor, 'processImage')
      })
      it('Should reject with the expected reason', (done) => {
        sandbox.processImageStub.rejects('Expected Error')
        processor.addProductImage('stream url').then(() => {
          expect(false).toBe(true)
          done()
        }).catch((err) => {
          expect(err).toBe('Expected Error')
          done()
        })
      })
      it('Should resolve with the expected result', (done) => {
        sandbox.processImageStub.resolves('Expected Result')
        processor.addProductImage('stream url').then((result) => {
          expect(result).toBe('Expected Result')
          done()
        }).catch((err) => {
          expect(false).toBe(true)
          done()
        })
      })
    })
  })

  describe('Given the resolveImageRequest function', () => {
    it('Should return a promise', () => {
      expect(returnsPromise(processor.resolveImageRequest)).toBe(true)
    })
    xdescribe('Given the requested image DOES NOT exist', () => {
      beforeEach(() => {
        sandbox.fsAccessError = 'File Error'
        sandbox.checkOriginalStub = sinon.stub(processor, 'checkForOriginal')
        sandbox.resizeImageStub = sinon.stub(processor, 'resizeImage')
      })
      it('Should reject with the expected reason', (done) => {
        sandbox.checkOriginalStub.rejects('Expected Error')
        processor.resolveImageRequest({
          params: {
            name: 'image.jpg',
            width: 200,
            height: 200,
          },
        }).then((result) => {
          expect(false).toBe(true)
          done()
        }).catch((reject) => {
          expect(reject).toBe('Expected Error')
          done()
        })
      })
      describe('Given the image is resized', () => {
        beforeEach(() => {
          sandbox.checkOriginalStub.resolves('stream')
          sandbox.pathJoinStub.returns('Expected Result')
        })
        it('Should resolve with the expected file path', (done) => {
          sandbox.resizeImageStub.resolves('stream')
          processor.resolveImageRequest({
            params: {
              name: 'image.jpg',
              width: 200,
              height: 200,
            },
          }).then((result) => {
            expect(result).toBe('Expected Result')
            done()
          }).catch(() => {
            expect(false).toBe(true)
            done()
          })
        })
      })
      xdescribe('Given the image CANNOT be resized', () => {
        it('Should reject with the expected reason', (done) => {
          sandbox.resizeImageStub.rejects('Expected Error')
          processor.resolveImageRequest({
            params: {
              name: 'image.jpg',
              width: 200,
              height: 200,
            },
          }).then((result) => {
            expect(false).toBe(true)
            done()
          }).catch((reject) => {
            expect(reject).toBe('Expected Error')
            done()
          })
        })
      })
      xdescribe('Given the requested image DOES exist', () => {
        describe('Given no file name is appended to the request', () => {
          it('Should resolve with the expected path', () => {
            expect(false).toBe(true)
          })
        })
        describe('Given a file name is appended to the request', () => {
          it('Should resolve with the expected path', () => {
            expect(false).toBe(true)
          })
        })
      })
    })
  })
})

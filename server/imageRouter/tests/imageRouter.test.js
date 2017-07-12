import expect from 'expect'
import sinon from 'sinon'
/* eslint no-unused-vars:off */
import sinonaspromised from 'sinon-as-promised'
/* eslint quote-props:off */
// import proxyquire from 'proxyquire'
import imageRouter from '../../imageRouter'

describe('Given the imageRouter', () => {
  describe('Given the resolveRequest method', () => {
    let sandbox
    beforeEach(() => {
      sandbox = sinon.sandbox.create()
      sandbox.resolveStub = sandbox.stub()
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('Should call processor.resolveImageRequest', () => {
      imageRouter.__set__('processor', { resolveImageRequest: sandbox.resolveStub.resolves('resolved') })
      imageRouter.__get__('resolveRequest')({}, {})
      expect(sandbox.resolveStub.calledOnce).toBe(true)
    })

    describe('Given resolveImageRequest resolves', () => {
      it('Should call res.sendFile with the success parameter', (done) => {
        imageRouter.__set__('processor', { resolveImageRequest: sandbox.resolveStub.resolves('resolved') })
        sandbox.res = {
          sendFile: (success) => {
            expect(success).toBe('resolved')
            done()
          },
        }
        imageRouter.__get__('resolveRequest')({}, sandbox.res)
      })
    })

    describe('Given resolveImageRequest rejects', () => {
      it('Should call res.status with 404 and the rejection parameter', (done) => {
        imageRouter.__set__('processor', { resolveImageRequest: sandbox.resolveStub.rejects('rejected') })
        sandbox.res = {
          status: (status) => {
            expect(status).toBe(404)
            done()
          },
        }
        imageRouter.__get__('resolveRequest')({}, sandbox.res)
      })
    })
  })
})

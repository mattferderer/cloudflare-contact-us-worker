import { handleRequest } from '../src/handler'
import makeServiceWorkerEnv from 'service-worker-mock'
import {WorkerGlobalScope, ValidRequestData} from './testhelpers'
import Toucan from 'toucan-js'

declare let global: WorkerGlobalScope

describe('Request Method', () => {
  beforeEach(() => {
    Object.assign(global, makeServiceWorkerEnv())
    jest.resetModules()
  })

  test('Accepts POST', async () => {

    global.fetch = jest.fn(() => {
      return Promise.resolve(
        new Response('{"score": ".9","success":"true"}', {status: 202, statusText: 'Accepted'})
      )
    });

    const request = new Request('/', { method: 'POST', body: JSON.stringify(ValidRequestData) });
    const logger = new Toucan({request});
    const result = await handleRequest(request, logger);
    expect(result.status).toEqual(202);

    const text = await result.text();
    expect(text).toEqual('Accepted');
  })

  test('Invalid on GET', async () => {
    const request = new Request('/', { method: 'GET', body: JSON.stringify(ValidRequestData) });
    const logger = new Toucan({request});
    const result = await handleRequest(request, logger);
    expect(result.status).toEqual(400)
    const text = await result.text()
    expect(text).toEqual('HTTP Method not accepted')
  })

  test('Invalid on PUT', async () => {
    const request = new Request('/', { method: 'PUT', body: JSON.stringify(ValidRequestData) });
    const logger = new Toucan({request});
    const result = await handleRequest(request, logger);
    expect(result.status).toEqual(400)
    const text = await result.text()
    expect(text).toEqual('HTTP Method not accepted')
  })

  test('Invalid on DELETE', async () => {
    const request = new Request('/', { method: 'DELETE', body: JSON.stringify(ValidRequestData) });
    const logger = new Toucan({request});
    const result = await handleRequest(request, logger);
    expect(result.status).toEqual(400)
    const text = await result.text()
    expect(text).toEqual('HTTP Method not accepted')
  })
})

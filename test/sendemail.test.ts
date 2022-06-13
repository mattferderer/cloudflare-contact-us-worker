import makeServiceWorkerEnv from 'service-worker-mock'
import {WorkerGlobalScope, ValidRequestData} from './testhelpers'
import { handleRequest, sendEmailFailedMsg } from '../src/handler'

declare let global: WorkerGlobalScope

describe('Send Email', () => {
  beforeEach(() => {
    Object.assign(global, makeServiceWorkerEnv())
    jest.resetModules()
  })  
  
  test('Handles Sendgrid error', async () => {
    jest.mock('toucan-js');
    const Toucan = (await import('toucan-js')).default;

    global.fetch = jest.fn((request: Request) => {
      if (request.url === 'https://api.sendgrid.com/v3/mail/send') { 
        return Promise.resolve(
          new Response('Invalid Request', { status: 404 })
        )    
      }
      return Promise.resolve(
        new Response('{"score": ".9","success":"true"}', {status: 202, statusText: 'Accepted'})
      )
    });

    const request = new Request('/', { method: 'POST', body: JSON.stringify(ValidRequestData) });
    const logger = new Toucan({request});
    
    const result = await handleRequest(request, logger);
    expect(result.status).toEqual(400);

    const text = await result.text();
    expect(text).toContain(sendEmailFailedMsg);

    expect(logger.captureMessage).toHaveBeenCalledTimes(1);
  })
})
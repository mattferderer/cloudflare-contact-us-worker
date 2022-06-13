import makeServiceWorkerEnv from 'service-worker-mock'
import { sendEmailFailedMsg } from '../src/handler';
import { validateCaptcha } from '../src/validate'
import {WorkerGlobalScope, ValidRequestData} from './testhelpers'

declare let global: WorkerGlobalScope

describe('Validate Captcha Tests', () => {
  beforeEach(() => {
    Object.assign(global, makeServiceWorkerEnv())
    jest.resetModules()
  })

  test('Captcha failed returns an error', async () => {

    jest.mock('toucan-js');
    const Toucan = (await import('toucan-js')).default;

    global.fetch = jest.fn((request: Request) => {
      return Promise.resolve(
        new Response('{"score": 1,"success":false}', {status: 202, statusText: ''})
      )
    });
    const request = new Request('/', { method: 'POST', body: JSON.stringify(ValidRequestData) });
    const logger = new Toucan({request});
    const isValid = await validateCaptcha(ValidRequestData, logger);

    expect(isValid.status).toEqual(false);
    expect(isValid.msg).toEqual(sendEmailFailedMsg);
  })


  test('Captcha below 0.5 score returns an error', async () => {

    jest.mock('toucan-js');
    const Toucan = (await import('toucan-js')).default;

    global.fetch = jest.fn((request: Request) => {
      return Promise.resolve(
        new Response('{"score": ".4","success":true}', {status: 202, statusText: 'Accepted'})
      )
    });
    const request = new Request('/', { method: 'POST', body: JSON.stringify(ValidRequestData) });
    const logger = new Toucan({request});
    const isValid = await validateCaptcha(ValidRequestData, logger);

    expect(isValid.status).toEqual(false);
    expect(isValid.msg).toEqual(sendEmailFailedMsg);
  })

  test('Captcha above 0.5 score returns a success', async () => {

    jest.mock('toucan-js');
    const Toucan = (await import('toucan-js')).default;

    global.fetch = jest.fn((request: Request) => {
      return Promise.resolve(
        new Response('{"score": ".6","success":true}', {status: 202, statusText: 'Accepted'})
      )
    });
    const request = new Request('/', { method: 'POST', body: JSON.stringify(ValidRequestData) });
    const logger = new Toucan({request});
    const isValid = await validateCaptcha(ValidRequestData, logger);

    expect(isValid.status).toEqual(true);
  })

})

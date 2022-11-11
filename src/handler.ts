import Toucan from "toucan-js";
import { ContactRequest, validateRequest } from './validate';
import { sendEmail } from "./sendEmail";

declare const ACCESS_CONTROL_ALLOW_ORIGIN: string;

export const sendEmailFailedMsg = 'Request failed to send. We have logged the error. Please try again later if you have not heard from us in 24 hours.';

export async function handleRequest(request: Request, sentry: Toucan): Promise<Response> {
  try {
    if (isOptionsRequest(request)) return handleOptionsRequest(request);
  
    const {isValid, msg, contactRequest} = await validateRequest(request, sentry);
    if (!isValid) {
      sentry.captureMessage(`Invalid Request: ${msg}`);
      return invalidRequestResponse(msg);
    } 
      
    const emailRequest = await sendEmail(contactRequest);
    if (emailRequest.status !== 202) {
      const msg = await emailRequest.text();
      sentry.captureMessage(`Sendgrid request failed.
      Request: ${JSON.stringify(contactRequest)}
      Response: ${emailRequest.status} ${msg}`);

      return invalidRequestResponse(sendEmailFailedMsg);
    }

    return acceptedResponse();

  } catch (error) {
    sentry.captureException(error);
    return invalidRequestResponse();
  }
}

const isOptionsRequest = (request: Request): boolean => request.method === 'OPTIONS';

const handleOptionsRequest = (request: Request): Response => {
  const headers = request.headers;
  if (
    headers.get('Origin') !== null &&
    headers.get('Access-Control-Request-Method') !== null &&
    headers.get('Access-Control-Request-Headers') !== null
  ) {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Headers': request.headers.get('Access-Control-Request-Headers') || '',
      }
    });
  }
  return invalidRequestResponse('', 204);
}

const invalidRequestResponse = (msg?: string, statusCode?: number): Response => {
  const responseMessage = msg || 'Invalid Request';
  const status = statusCode || 400;
  const response = new Response(responseMessage,
    {
      status
    });
  response.headers.set('Access-Control-Allow-Origin', ACCESS_CONTROL_ALLOW_ORIGIN);
  return response;
}

const acceptedResponse = (): Response => {
  const response = new Response('Accepted', { status: 202 });
  response.headers.set('Access-Control-Allow-Origin', ACCESS_CONTROL_ALLOW_ORIGIN);
  return response;  
}
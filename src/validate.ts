import Toucan from "toucan-js";
import { sendEmailFailedMsg } from "./handler";

declare const RECAPTCHA_SECRET: string;

export const validateRequest = async (request: Request, sentry: Toucan): Promise<ValidateRequestResult> => {
    if (!isPostRequest(request)) return { isValid: false, msg: 'HTTP Method not accepted', contactRequest:EMPTY_CONTACT_REQUEST };

    let contactRequest: ContactRequest;
    const body = await request.text();
    try {
        contactRequest = JSON.parse(body);
    } catch (error) {
        contactRequest = EMPTY_CONTACT_REQUEST;
        contactRequest.message = body;
        return { isValid: false, msg: 'Invalid JSON body format', contactRequest };
    }

    const isValidContactRequest = validateContactRequestBody(contactRequest);
    if (!isValidContactRequest.status) return { isValid: false, msg: isValidContactRequest.msg, contactRequest };

    const isValidateCaptcha = await validateCaptcha(contactRequest, sentry);
    if (!isValidateCaptcha.status) return { isValid: false, msg: isValidateCaptcha.msg, contactRequest };

    return { isValid: true, msg: '', contactRequest };
}



export const validateContactRequestBody = (request: ContactRequest): StatusMsg => {
    if (!request.from) return { status: false, msg: 'Missing e-mail & name' };
    if (!request.message) return { status: false, msg: 'Missing message' };
    if (!request.from.email) return { status: false, msg: 'Missing e-mail' };
    if (!request.from.name) return { status: false, msg: 'Missing name' };
    return { status: true, msg: 'Valid Request' };
}

const isPostRequest = (request: Request): boolean => request.method === 'POST';

export const validateCaptcha = async (request: ContactRequest, sentry: Toucan): Promise<StatusMsg> => { 
    if (!request.token) {
        sentry.captureMessage('Missing captcha token. Request:' + JSON.stringify(request));
        return Promise.resolve({ status: false, msg: sendEmailFailedMsg });
    }

    const captchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${request.token}`;
    const result = await fetch(captchaUrl);
    const json = await result.json() as CaptchaResponse;

    if (!json.success) {
        sentry.captureMessage('Invalid captcha response.' + getCaptchaResponseAndOriginalRequest(json, request));
        return Promise.resolve({ status: false, msg: sendEmailFailedMsg });
    }

    if (captchaScoreIsNotValid(json.score)) {
        sentry.captureMessage('Low Captcha Score. ' + getCaptchaResponseAndOriginalRequest(json, request));
        return Promise.resolve({ status: false, msg: sendEmailFailedMsg });
    }

    return { status: true, msg: '' };
}

export const getCaptchaResponseAndOriginalRequest = (captchaResponse: CaptchaResponse, request: ContactRequest): string => {
    return 'Captcha Response:' + JSON.stringify(captchaResponse) + ' User Request:' + JSON.stringify(request);
}

export const captchaScoreIsNotValid = (score: number): boolean =>  score < 0.5;

const EMPTY_CONTACT_REQUEST: ContactRequest = {
    from: { email: '', name: '' },
    subject: '',
    message: '',
    token: '',
}

interface ValidateRequestResult {
    isValid: boolean;
    msg: string;
    contactRequest: ContactRequest;
}

export interface ContactRequest {
    from: Contact
    subject: string
    message: string
    token: string
}

export interface Contact {
    name: string
    email: string
}

export interface CaptchaResponse {
    success: boolean
    challenge_ts: string
    hostname: string
    score: number
    action: string
    'error-codes': string[]
}

type StatusMsg = {
    status: boolean;
    msg: string;
};
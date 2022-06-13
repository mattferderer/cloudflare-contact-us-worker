import { ContactRequest } from './validate';

declare const SENDGRID_API_KEY: string;
declare const RECIPIENT_NAME: string;
declare const RECIPIENT_EMAIL: string;
declare const MAIL_SUBJECT: string;

export const sendEmail = (contactRequest: ContactRequest): Promise<Response> => {
    const emailRequest =
        new Request('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            body: formatSendGridRequest(contactRequest),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SENDGRID_API_KEY}`
            }
        });

    return fetch(emailRequest);
}

const formatSendGridRequest = (contactRequest: ContactRequest): string => JSON.stringify({
    personalizations: [
        {
            to: [
                {
                    email: RECIPIENT_EMAIL,
                    name: RECIPIENT_NAME
                }
            ]
        }
    ],
    from: {
        email: contactRequest.from.email,
        name: contactRequest.from.name
    },
    subject: MAIL_SUBJECT,
    content: [{ type: 'text/plain', value: contactRequest.message }]
})
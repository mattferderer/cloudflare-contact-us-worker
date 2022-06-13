import React, { useState, SyntheticEvent } from "react"
import { Helmet } from "react-helmet"
import { CheckCircleIcon, XIcon, ExclamationCircleIcon } from '@heroicons/react/outline'

const CLOUDFLARE_WORKER_URL = "https://your-url-goes-here.cloudflare1234.workers.dev"
const GOOGLE_CAPTCHA_KEY = "your-google-captcha-key-goes-here"

const ContactPage = () => {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [showAlert, setShowAlert] = useState(false)
    const sendEmailFailedMsg = 'Request failed to send. We have logged the error. Please try again later if you have not heard from us in 24 hours.';

    const handleSubmit = (e: SyntheticEvent<HTMLElement>) => {
        e.preventDefault()
        window.grecaptcha.ready(async function () {
            const token = await window.grecaptcha.execute(GOOGLE_CAPTCHA_KEY, { action: 'submit' });
            const body = {
                from: {
                    name: name,
                    email: email,
                },
                message: message,
                token: token
            };
            try {
                const request = await fetch(CLOUDFLARE_WORKER_URL, {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                if (request.status === 202) {
                    setShowAlert(true)
                    setSuccess(true)
                    setError(false)
                    setErrorMessage('')
                } else {
                    const text = await request.text();
                    setShowAlert(true)
                    setSuccess(false)
                    setError(true)
                    setErrorMessage(text)
                }
            } catch (error) {
                setShowAlert(true)
                setSuccess(false)
                setError(true)
                setErrorMessage(sendEmailFailedMsg)
            }
        })
    }



    return (
        <div>
            <Helmet title="Contact" defer={false}>
                <script async src={`https://www.google.com/recaptcha/api.js?render=${GOOGLE_CAPTCHA_KEY}`}></script>
            </Helmet>
            {showAlert && error ? <Alert success={false} message={errorMessage} onDismiss={() => setShowAlert(false)} /> : ''}
            {showAlert && success ? <Alert success={true} message='Message sent!' onDismiss={() => setShowAlert(false)} /> : ''}
            <div className="rounded overflow-hidden shadow-lg py-6 px-6">
                <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
                <div className="mt-12">
                    <form action="#" method="POST" className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Name
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    autoComplete="given-name"
                                    className="py-3 px-4 block w-full shadow-sm focus:ring-green-500 focus:border-green-500 border-gray-300 border rounded-md"
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    className="py-3 px-4 block w-full shadow-sm focus:ring-green-500 focus:border-green-500 border-gray-300 border rounded-md"
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                Message
                            </label>
                            <div className="mt-1">
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={4}
                                    className="py-3 px-4 block w-full shadow-sm focus:ring-green-500 focus:border-green-500 border-gray-300 border rounded-md"
                                    defaultValue={''}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <button
                                data-sitekey={GOOGLE_CAPTCHA_KEY}
                                type="submit"
                                disabled={showAlert}
                                className={`w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white focus:outline-none focus:ring-2 bg-green-900  focus:ring-offset-2 focus:ring-green-00 ${showAlert ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer hover:bg-green-700'}`}
                                onClick={e => handleSubmit(e)}
                            >
                                Let's talk
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

function Alert(props: React.PropsWithChildren<{ success: Boolean, message: String, onDismiss: () => void }>) {
    return (
        <div className="fixed bottom-0 inset-x-0 pb-2 sm:pb-5">
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                <div className={`p-2 rounded-lg ${props.success ? 'bg-green-600' : 'bg-red-600'} shadow-lg sm:p-3`}>
                    <div className="flex items-center justify-between flex-wrap">
                        <div className="w-0 flex-1 flex items-center">
                            {
                                props.success ?
                                    <span className={`flex p-2 rounded-lg ${props.success ? 'bg-green-800' : 'bg-red-800'}`}>
                                        <CheckCircleIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                    </span>
                                    :
                                    <span className={`flex p-2 rounded-lg ${props.success ? 'bg-green-800' : 'bg-red-800'}`}>
                                        <ExclamationCircleIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                    </span>
                            }
                            <p className="ml-3 font-medium text-white truncate">
                                <span className="inline">{props.message}</span>
                            </p>
                        </div>
                        <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-2">
                            <button
                                type="button"
                                className={`-mr-1 flex p-2 rounded-md hover:bg-color-500 focus:outline-none focus:ring-2 focus:ring-white`}
                                onClick={props.onDismiss}
                            >
                                <span className="sr-only">Dismiss</span>
                                <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default ContactPage

export interface ContactRequest {
    from: Contact
    message: string
}

export interface Contact {
    name: string
    email: string
}
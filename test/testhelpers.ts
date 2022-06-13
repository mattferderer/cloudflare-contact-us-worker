import { ContactRequest } from "../src/validate";

export interface WorkerGlobalScope {
    fetch(request: Request): Promise<Response>;
    addEventListener<Type extends keyof WorkerGlobalScopeEventMap>(type: Type, handler: EventListenerOrEventListenerObject<WorkerGlobalScopeEventMap[Type]>, options?: EventTargetAddEventListenerOptions | boolean): void;
}

export const ValidRequestData: ContactRequest = {
    from: {
        email: 'test@example.com',
        name: 'Matt'
    },
    subject: 'Subject Example',
    message: 'Message example. This is a test.',
    token: 'abcToken'
}
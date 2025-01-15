import { IHandleMessage } from '../interfaces/message.handler.interface';
import { Whatsapp } from '../whatsapp';

export class Publisher {
    subscribers: Subscriber[] = [];

    notifyAll(update: IHandleMessage, instance: Whatsapp) {
        for (const subscriber of this.subscribers) {
            subscriber.update(update, instance);
        }
    }
    addSubscriber(subscriber: Subscriber) {
        this.subscribers.push(subscriber);
    }
}

export class Subscriber {
    instance: Whatsapp;
    constructor(instance: Whatsapp) {
        this.instance = instance;
    }
    update(update: IHandleMessage, instance: Whatsapp) {}
}

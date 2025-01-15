import { delay } from '@whiskeysockets/baileys';

export class Queue {
    private static queue: (() => Promise<void>)[] = [];
    private static isRunning = false;

    static add(job: () => Promise<void>) {
        Queue.queue.push(job);
        if (Queue.isRunning == false) Queue.run();
    }

    static async run() {
        if (Queue.queue.length <= 0 || Queue.isRunning) return;
        Queue.isRunning = true;

        while (this.queue.length > 0) {
            const job = Queue.queue.shift();

            if (!job) continue;

            try {
                // To process other commands if takes too long to process one
                await Promise.race([delay(15000), job()]);
            } catch (error) {
                if (error instanceof Error) console.error(`[ERROR PROCESSING JOB IN QUEUE]: ${error.message}`);
            }
        }

        Queue.isRunning = false;
        if (this.queue.length) this.run();
    }
}

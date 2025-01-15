import { IHandleMessage } from '../interfaces/message.handler.interface';
import { Whatsapp } from '../whatsapp';

interface CommandConfigs {
    name: string;
    aliases: string[];
    developerOnly?: boolean;
    onlyGroup?: boolean;
    onlyGroupAdmin?: boolean;
    description?: string;
}
interface ICommand extends CommandConfigs {
    execute: (messagePayload: IHandleMessage, args: string[]) => Promise<any>;
    instance: Whatsapp;
}

export class Command implements ICommand {
    instance: Whatsapp;
    name: string;
    aliases: string[];
    developerOnly: boolean = false;
    onlyGroup: boolean = false;
    onlyGroupAdmin: boolean = false;
    description?: string | undefined;

    constructor(instance: Whatsapp, options: CommandConfigs) {
        this.instance = instance;
        this.name = options.name;
        this.aliases = options.aliases;
        this.developerOnly = options.developerOnly || false;
        this.onlyGroup = options.onlyGroup || false;
        this.onlyGroupAdmin = options.onlyGroupAdmin || false;
        this.description = options.description || undefined;
    }

    async execute({ author, messageBody, messageData, messageProps }: IHandleMessage, args: string[]) {}
}

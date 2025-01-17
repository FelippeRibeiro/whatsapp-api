#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Obter o nome do comando do parâmetro passado

const commandName = process.argv[2];
const type = process.argv[3] || 'base';

if (!commandName) {
  console.error('Por favor, forneça o nome do comando como argumento.');
  process.exit(1);
}

// Primeira letra maiúscula para a classe e minúscula para o nome
const className = commandName.charAt(0).toUpperCase() + commandName.slice(1);
const commandNameLowerCase = commandName.toLowerCase();

const commandPath = path.join(__dirname, 'src', 'commands');
// Caminho onde o arquivo será criado
if (type != 'base' && !fs.existsSync(path.join(commandPath, type))) {
  console.error(`Pasta ${type} não existe.`);
  process.exit(1);
}

// Conteúdo do arquivo TypeScript
const fileContent = `
import { IHandleMessage } from '${type == 'base' ? '../' : '../../'}interfaces/message.handler.interface';
import { Command } from '${type == 'base' ? '../' : '../../'}structures/commands';
import { Whatsapp } from '${type == 'base' ? '../' : '../../'}whatsapp';

export default class ${className}Command extends Command {
  constructor(instance: Whatsapp) {
    super(instance, {
      name: '${commandNameLowerCase}',
      aliases: ['${commandNameLowerCase}'],
    });
  }

  async execute(
    { author, messageBody, messageData, messageProps, chatJid, messageQuoted, messageType }: IHandleMessage,
    args: string[],
  ): Promise<void> {
    // Your code here
  }
}
`;

const filePath = type == 'base' ? path.join(commandPath, `${commandNameLowerCase}.ts`) : path.join(commandPath, type, `${commandNameLowerCase}.ts`);

// Certifique-se de que a pasta existe
fs.mkdirSync(path.dirname(filePath), { recursive: true });

// Escreve o conteúdo no arquivo
fs.writeFileSync(filePath, fileContent.trim(), 'utf8');

console.log(`Comando base [ ${commandName} ] criado em ${filePath}`);

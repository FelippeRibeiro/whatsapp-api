import 'dotenv/config';
console.log('Hello world!');

import { API } from './api/server';

const Server = new API(3333);

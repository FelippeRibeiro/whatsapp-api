import 'dotenv/config';

import { API } from './api/server';

const Server = new API(3333);

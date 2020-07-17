import 'dotenv/config';
import path from 'path';
import express from 'express';
import routes from './routes';
import cors from 'cors';
import './database';

class App {
  constructor() {
    this.server = express();
    this.server.use(cors());
    this.server.use(express.json());
    this.server.use(routes);
    // servir arquivos staticos
    this.server.use(
      '/files', // rota que vai servir os arquivos staticos
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }
}

export default new App().server;

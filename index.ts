import express from 'express';
import { createReadStream } from 'fs';
import { pipeline } from 'stream';

const PORT = 3000;

// init
const app = express();

// routes
app.get('/', (request, response) => {
  console.log('Received request');
  const file = createReadStream('../testdata.txt');

  console.log('Writing header');
  response.writeHead(200, 'OK', { 'Content-Type': 'text/plain' });
  pipeline(file, response, (error) => {
    if (error) {
      console.error(error, 'Stream errored');
    }

    console.log('Ending response');
    response.end();
    console.log('Response done');
  });
});

// start server
app.listen(PORT, () => {
  console.log('Server listening');
});

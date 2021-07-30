import express from 'express';
import { createReadStream } from 'fs';
import { pipeline, Transform } from 'stream';
import type { TransformCallback } from 'stream';

const PORT = 3000;

// init
const app = express();

// routes
app.get('/', (request, response) => {
  console.log('Received request');
  const file = createReadStream('./testdata.txt');

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

app.get('/with-transform', (request, response) => {
  console.log('Received request');
  const enc: BufferEncoding = 'utf8';
  const file = createReadStream('./testdata.txt', {
    encoding: enc,
    highWaterMark: 3,
  });

  const capitalizer = new Transform({
    transform(
      chunk: Buffer,
      encoding: BufferEncoding | 'buffer',
      callback: TransformCallback,
    ) {
      console.log('encoding is', encoding);
      let chunkStr: string;
      if (encoding === 'buffer') {
        chunkStr = chunk.toString(enc);
      } else {
        chunkStr = chunk.toString(encoding);
      }

      console.log('Capitalizing string:', chunkStr);
      const capped = chunkStr.toUpperCase();

      this.push(capped, enc);
      callback();
    },
  });

  console.log('Writing header');
  response.writeHead(200, 'OK', { 'Content-Type': 'text/plain' });

  pipeline(file, capitalizer, response, (error) => {
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

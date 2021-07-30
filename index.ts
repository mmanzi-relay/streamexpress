import express from 'express';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { createReadStream } from 'fs';
import { pipeline, Transform } from 'stream';
import type { TransformCallback } from 'stream';
import { promisify } from 'util';

const PORT = 3000;

// init
const app = express();

// routes

//// root
app.get('/', (request, response) => {
  console.log('Received request', {
    writable: response.writable,
    ended: response.writableEnded,
    finished: response.writableFinished,
  });

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

//// root with transform
const enc: BufferEncoding = 'utf8';
const getCapitalizer = () =>
  new Transform({
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

app.get('/with-transform', (request, response) => {
  console.log('Received request', {
    writable: response.writable,
    ended: response.writableEnded,
    finished: response.writableFinished,
  });

  const file = createReadStream('./testdata.txt', {
    encoding: enc,
    highWaterMark: 3,
  });

  console.log('Writing header');
  response.writeHead(200, 'OK', { 'Content-Type': 'text/plain' });

  pipeline(file, getCapitalizer(), response, (error) => {
    if (error) {
      console.error(error, 'Stream errored');
    }

    console.log('Ending response');
    response.end();
    console.log('Response done');
  });
});

//// root with transform as async
type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

const wrap =
  (handler: AsyncRequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) =>
    handler(req, res, next).catch(next);

const asyncPipeline = promisify(pipeline);

app.get(
  '/with-transform/async',
  wrap(async (request, response) => {
    console.log('A - Received request', {
      writable: response.writable,
      ended: response.writableEnded,
      finished: response.writableFinished,
    });

    const file = createReadStream('./testdata.txt', {
      encoding: enc,
      highWaterMark: 16,
    });

    console.log('B - Writing header');
    response.writeHead(200, 'OK', { 'Content-Type': 'text/plain' });

    try {
      console.log('C - Starting pipeline');
      await asyncPipeline(file, getCapitalizer(), response);
      console.log('D - Pipeline done');
    } catch (error) {
      console.error(error, 'E - Stream errored');
    }
  }),
);

// start server
app.listen(PORT, () => {
  console.log('Server listening');
});

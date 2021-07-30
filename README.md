# Stream Responses from Express Server

A proof of concept to continuously stream data from an Express server response to an HTTP client.

## Endpoints

### `/`

Stream data from a [file](./testdata.txt) and pipeline it to the `response` as `text/plain`.

Nothing else fancy happens. However, note that the file being read is only a few lines of text, and `createReadStream` chunks files in [64kiB](https://nodejs.org/docs/latest-v16.x/api/fs.html#fs_fs_createreadstream_path_options) so it's processed as a single chunk.

### `/with-transform`

Same as [`/`](#/) but uses a `Transform` to convert all the text to uppercase. This also tests transmitting the file as multiple chunks by setting the `highWaterMark` to 3 bytes (which ends up being 3 characters at a time).

### `/with-transform/async`

Same as [`/with-transform`](#/with-transform) but promisifies the `pipeline` function and `await`s its completion before ending the response.

## Notes

### `BufferEncoding`

When implementing [`transform`](https://nodejs.org/docs/latest-v16.x/api/stream.html#stream_transform_transform_chunk_encoding_callback) in the `Transform` constructor options, there are three parameters that you need to define. The official Node documentation says that the second of these parameters (`encoding`) is a string, representing the encoding of the data chunk _or_ the string `'buffer'` (as a special case). The TypeScript type definitions for this parameter is `BufferEncoding` which covers the normal cases of the string encoding type, but does not cover the possibility that `encoding` may have a value of `'buffer'`. Thus, the type of this parameter should be `BufferEncoding | 'buffer'`.

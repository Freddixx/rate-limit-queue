[![rate limit queue on MPM](https://img.shields.io/badge/rate--limit--q-1.0.1-green?logo=npm&style=flat)](https://www.npmjs.com/package/rate-limit-q)
# Rate Limit Queue (rate-limit-q)

This package gives you a rate limit queue which will evenly process items as fast as possible according to a set daily limit.

The items will be re-appended after every processing step so that the queue will perform an infinite round robin.

If you want to use other time frames, just recalculate the limit based on a 24h time window.

## Installation

```Bash
// npm
npm install rate-limit-q
// yarn
yarn add rate-limit-q
```

## Usage

Creating a queue puts it immediately to work, so there is no other setup needed:

```TypeScript
// Start a queue, pass it the function to be called on every update and the initial data.
const q = new Queue<string>(onUpdate, ['one', 'two', 'three'], 24);
```

This example creates a queue with 3 items which are processed repeatedly but stretched out to an interval so that no more than 24 calls are made over the course of one day.

Don't forget to tear down the queue when terminating your app so that said intervals will get cleared:

```TypeScript
const shutDown = () => {
  q.stop();
  process.exit();
};

process.on("SIGTERM", shutDown);
```

## Parameters

- `onProcess`: A function to be called for each processed item. It should return the (potentially modified) item when done.
- `items`: The initial set of items as an array.
- `dailyRateLimit`: The daily maximum to which the processing will be stretched out to.
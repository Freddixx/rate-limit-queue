/**
 * The worker function is called whenever the queue processes an 
 * item. It returns the item in case the user wants to perform
 * any update based on it. 
 */
type WorkerFunction<T> = (s: T) => Promise<T>;
const DEFAULT_POLL_INTERVAL_IN_MILLISECONDS = 10 * 1000;
const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

export class Queue<T> {
  intervalId!: NodeJS.Timeout;
  onProcess: WorkerFunction<T>;
  queue: T[] = [];
  snapshot: T[] = [];
  sourceQueueOnEveryRun: boolean;
  dailyRateLimit: number;

  constructor(onProcess: WorkerFunction<T>, items: T[], dailyRateLimit: number, sourceQueueOnEveryRun = false) {
    this.queue = items;
    this.snapshot = items;
    this.onProcess = onProcess;
    this.sourceQueueOnEveryRun = sourceQueueOnEveryRun;
    this.dailyRateLimit = dailyRateLimit;
    this.start();
  }

  private start = () => {
    this.intervalId = setInterval(
      this.processItem,
      this.computePollIntervalInSeconds()
    );
  }

  stop = (): void => {
    clearInterval(this.intervalId);
  };

  private computePollIntervalInSeconds = (): number => {
    const queueLength = this.snapshot.length;
    if (queueLength === 0) {
      return DEFAULT_POLL_INTERVAL_IN_MILLISECONDS;
    }
    const pollInterval = ONE_DAY_IN_MILLISECONDS / this.dailyRateLimit;
    console.log(`Processing items every ${pollInterval/1000}s now.`);
    return pollInterval;
  };

  private processItem = async (): Promise<void> => {
    // In case the interval is killed mid-processing and gets renewed
    // we store a snapshot of the queue.
    this.snapshot = [...this.queue];
    const item = this.queue.shift();
    if (!item) {
      return;
    }
    // Do the processing and allow the worker
    // to change the entity if needed.
    const updated = await this.onProcess(item);
    //add it back to the end
    this.queue.push(updated);
  };

  addItem = (item: T): void => {
    this.stop();
    this.snapshot.push(item);
    this.queue = [...this.snapshot];
    this.start();
  };
}

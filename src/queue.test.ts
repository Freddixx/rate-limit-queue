import { Queue } from "./queue";

describe("Queue unit tests", () => {

  let q: Queue<string>;

  afterEach(() => {
    jest.useRealTimers();
    if (q) {
      q.stop();
    }
  });
  test("Queue should call process function", async () => {
    jest.useFakeTimers();
    const process = jest.fn();
    q = new Queue<string>(process, ["item 1", "item 2"], 500);
    jest.runOnlyPendingTimers();
    expect(process).toHaveBeenCalledWith("item 1");
    jest.runOnlyPendingTimers();
    expect(process).toHaveBeenCalledWith("item 2");
  });

  test("Should add new item to the queue and process it", async () => {
    jest.useFakeTimers();
    const process = jest.fn();
    q = new Queue<string>(process, ["item 1", "item 2"], 500);
    q.addItem("item 3");
    // Even if the q got stopped at the beginning and re-runs the first two items,
    // 4 runs should be enough until item 3 is eventually processed.
    for (let tries = 1; tries < 4; tries++) {
      jest.runOnlyPendingTimers();
    }
    expect(process).toHaveBeenCalledWith("item 3");
  });
});

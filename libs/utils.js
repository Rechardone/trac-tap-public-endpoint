

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
exports.sleep = sleep

class ThreadPool {
  constructor(maxThreads) {
    this.maxThreads = maxThreads;
    this.queue = [];
    this.runningThreads = 0;
  }

  async enqueue(task) {
    return new Promise((resolve, reject) => {
      const executor = async () => {
        try {
          resolve(await task());
        } catch (error) {
          reject(error);
        } finally {
          this.runningThreads--;
          this.processQueue();
        }
      };

      this.queue.push(executor);
      this.processQueue();
    });
  }

  processQueue() {
    while (this.runningThreads < this.maxThreads && this.queue.length > 0) {
      const task = this.queue.shift();
      this.runningThreads++;
      task();
    }
  }
}
exports.ThreadPool = ThreadPool
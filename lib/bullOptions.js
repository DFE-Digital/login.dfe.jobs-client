// https://docs.bullmq.io/guide/queues/auto-removal-of-jobs
const bullQueueTtl = {
  removeOnComplete: {
    age: 3600, // keep up to 1 hour
    count: 50, // keep up to 50 jobs
  },
  removeOnFail: {
    age: 12 * 3600, // keep up to 12 hours
  },
};

module.exports = {
  bullQueueTtl,
};

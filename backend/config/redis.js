// Mock Redis client - NO REAL CONNECTION
const inMemoryStorage = new Map();

const mockRedisClient = {
  get: (key) => Promise.resolve(inMemoryStorage.get(key) || null),
  set: (key, value) => Promise.resolve(inMemoryStorage.set(key, value) && 'OK'),
  setEx: (key, seconds, value) => {
    inMemoryStorage.set(key, value);
    setTimeout(() => inMemoryStorage.delete(key), seconds * 1000);
    return Promise.resolve('OK');
  },
  del: (key) => Promise.resolve(inMemoryStorage.delete(key) ? 1 : 0),
  connect: () => {
    console.log('Mock Redis client ready (in-memory storage)');
    return Promise.resolve();
  },
  on: () => {} // Do nothing
};

module.exports = mockRedisClient;

import IORedis from 'ioredis';
import redisConfig from '../../../config/redis.config';

class RedisService {
  redisClient: IORedis;

  constructor() {
    this.redisClient = new IORedis(redisConfig);
    console.log(`Connecting to Redis at ${redisConfig.host}:${redisConfig.port}`);
  }

  async getValue(baseKey: string, paramKey: string) {
    return await this.redisClient.get(`${baseKey}:${paramKey}`);
  }

  async setValue(baseKey: string, paramKey: string, value: string | number, expiresInMs?: number) {
    if (expiresInMs === undefined) {
      return this.redisClient.set(`${baseKey}:${paramKey}`, value);
    }

    return this.redisClient.set(`${baseKey}:${paramKey}`, value, 'PX', expiresInMs);
  }

  async deleteKey(key: string) {
    await this.redisClient.del(key);
  }

  async flushAll() {
    await this.redisClient.flushall();
  }

  shutdown() {
    this.redisClient.disconnect();
  }
}

export default new RedisService();

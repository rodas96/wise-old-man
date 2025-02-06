import IORedis from 'ioredis';
import redisConfig from '../../../config/redis.config';

class RedisService {
  redisClient: IORedis;

  constructor() {
    this.redisClient = new IORedis(redisConfig);
    console.log(`Redis service initialized with prefix: ${this.testPrefix}`);
  }

  private getNamespacedKey(baseKey: string, paramKey: string): string {
    return `${this.testPrefix}:${baseKey}:${paramKey}`;
  }

  async getValue(baseKey: string, paramKey: string) {
    const namespacedKey = this.getNamespacedKey(baseKey, paramKey);
    return await this.redisClient.get(namespacedKey);
  }

  async setValue(baseKey: string, paramKey: string, value: string | number, expiresInMs?: number) {
    const namespacedKey = this.getNamespacedKey(baseKey, paramKey);

    if (expiresInMs === undefined) {
      return this.redisClient.set(namespacedKey, value);
    }

    return this.redisClient.set(namespacedKey, value, 'PX', expiresInMs);
  }

  async deleteKey(baseKey: string, paramKey: string) {
    const namespacedKey = this.getNamespacedKey(baseKey, paramKey);
    await this.redisClient.del(namespacedKey);
  }

  async flushAll() {
    const keys = await this.redisClient.keys(`${this.testPrefix}:*`);
    if (keys.length > 0) {
      await this.redisClient.del(keys);
    }
  }

  shutdown() {
    this.redisClient.disconnect();
  }
}

export default new RedisService();

import Redis from 'ioredis';


interface RedisConnectionConfig {
  host: string;
  port: number;
}


export class RedisConnectHelper {
  private client: Redis;

  public connectToRedisAndSaveClient(config: RedisConnectionConfig) {
    if (this.client) {
      return this.client;
    }

    this.client = this.connectToRedis(config);

    return this.client;
  }

  public getClient() {
    return this.client ?? null;
  }

  protected connectToRedis(config: RedisConnectionConfig) {
    const client = new Redis({
      host: config.host,
      port: config.port,
      showFriendlyErrorStack: true,
    });

    client.on('error', (err) => {
      console.log('Redis error: ' + err);
    });

    client.on('connect', () => {
      console.log('Connected to Redis');
    });

    return client;
  }
}


let redisConnectHelper: RedisConnectHelper;


export function getRedisConnectHelper() {

    if (!redisConnectHelper) {
      redisConnectHelper = new RedisConnectHelper();
    }

    return redisConnectHelper;
}


export function connectToRedisAndSaveClient(config: RedisConnectionConfig) {
  return getRedisConnectHelper().connectToRedisAndSaveClient(config);
}


export function getRedisClient() {
  return getRedisConnectHelper().getClient();
}
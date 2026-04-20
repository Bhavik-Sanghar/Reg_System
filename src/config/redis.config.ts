import { createClient } from 'redis';

const client = createClient();

client.on('error', (err) => console.log('Redis Client Error', err));

async function connectRedis() {
    await client.connect();
}
connectRedis();

export default client;

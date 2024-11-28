import { createClient } from 'redis';

// Initialize Redis client
const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379', // Use an environment variable or localhost
});

// Error handling
client.on('error', (err) => {
  console.log('Redis Client Error:', err);
});

// Connect to Redis
client.connect().catch((err) => console.error('Error connecting to Redis:', err));

// Function to get data from Redis and parse it
export const getAsync = async <T>(key: string): Promise<T | null> => {
  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) as T : null; // Parse the stored JSON data and cast it to the correct type
  } catch (error) {
    console.error('Error fetching data from Redis:', error);
    return null;
  }
};

// Function to post data to Redis (set a key-value pair)
export const setAsync = async <T>(key: string, value: T): Promise<boolean> => {
  try {
    // Store the value as a JSON string in Redis
    await client.set(key, JSON.stringify(value));
    return true; // Successfully set the data
  } catch (error) {
    console.error('Error posting data to Redis:', error);
    return false;
  }
};

export { client }; // Export the client for use elsewhere

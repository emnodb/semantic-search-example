/* eslint-disable @typescript-eslint/no-non-null-assertion -- needed*/
/* eslint-disable no-console -- needed*/
import { config } from 'dotenv';
import { getEnv, validateEnvironmentVariables } from './utils/util';
import { Emno } from '@emno/sdk';

config();
validateEnvironmentVariables();

export const query = async (queryText: string, topK: number) => {
  validateEnvironmentVariables();
  const emno = new Emno({
    token: getEnv('EMNO_TOKEN'),
    shouldThrow: true,
  });

  // Get collection
  const collectionName = getEnv('EMNO_COLLECTION');
  const collection = await emno.getCollection(collectionName);
  if (!collection) {
    throw new Error(`Collection ${collectionName} does not exist`);
  }

  const startTime = performance.now();

  // Query the collection
  const results = await collection.queryByText({
    content: [queryText],
    topK: topK,
  });

  // Print the results
  if (results && results.length > 0) {
    const result = results[0];
    console.log(
      result
        .sort((a, b) => a.distance! - b.distance!)
        .map((match) => ({
          text: match.content,
          distance: match.distance,
        }))
    );
  } else {
    console.log('Failed to get results from query');
  }
  // Stop the timer
  const endTime = performance.now();

  // Calculate the duration in milliseconds
  const duration = endTime - startTime;

  // Log the duration
  console.log(`Process duration: ${duration} milliseconds`);
};

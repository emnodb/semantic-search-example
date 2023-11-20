/* eslint-disable no-console -- needed*/
import { config } from 'dotenv';
import { embedder } from './embeddings';
import { getEnv, validateEnvironmentVariables } from './utils/util';
import { Emno } from './emno/index';

config();
validateEnvironmentVariables();

export const query = async (queryText: string, topK: number) => {
  validateEnvironmentVariables();
  const emno = new Emno({
    token: getEnv('EMNO_TOKEN'),
  });

  // Target the index/collection
  const collectionName = getEnv('EMNO_COLLECTION');
  const collection = await emno.getCollection(collectionName);

  await embedder.init();

  // Embed the query
  const queryEmbedding = await embedder.emEmbed(queryText);

  const startTime = performance.now();
  // Query the index using the query embedding
  const resultsRaw = await emno.query(collection?.id || '', {
    vectors: [queryEmbedding.values],
    limit: topK,
  });
  // Print the results
  if (resultsRaw && resultsRaw.length > 0) {
    const result = resultsRaw[0];
    console.log(
      result
        .sort((a, b) => a.distance - b.distance)
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

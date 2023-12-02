/* eslint no-console: 0 -- we are allowing it */
import { performance } from 'node:perf_hooks';
import cliProgress from 'cli-progress';
import { config } from 'dotenv';
import { Emno } from '@emno/sdk';
import loadCSVFile from './csvLoader';
import {
  getEnv,
  sliceIntoChunks,
  validateEnvironmentVariables,
} from './utils/util';

// Load environment variables from .env
config();

const progressBar = new cliProgress.SingleBar(
  {},
  cliProgress.Presets.shades_classic
);

let counter = 0;
const MAX_ROWS = 100_000;
const BATCH_SIZE = 100;

export const load = async (csvPath: string, column: string) => {
  validateEnvironmentVariables();

  // Create a readable stream from the CSV file
  const { data, meta } = await loadCSVFile(csvPath);

  // Ensure the selected column exists in the CSV file
  if (!meta.fields?.includes(column)) {
    console.error(`Column ${column} not found in CSV file`);
    process.exit(1);
  }

  // Extract the selected column from the CSV file
  const documents: string[] = [];
  for (let i = 0; i < data.length && i < MAX_ROWS; i++) {
    documents.push(data[i][column] as string);
  }

  // Configure an emno client instance
  const emno = new Emno({
    token: getEnv('EMNO_TOKEN'),
  });

  // Get collection name name
  const collectionName = getEnv('EMNO_COLLECTION');

  // Check whether the collection already exists. If it doesn't, create
  // an emno collection with a dimension of 384 to hold the outputs
  // of our embeddings model.
  let currentCollection = await emno.getCollection(collectionName);
  if (!currentCollection) {
    // create one
    currentCollection = await emno.createCollection({
      name: collectionName,
      config: {
        dim: 384,
        model: 'HUGGINGFACE-MINI-LM-L6',
      },
    });
    console.log(`New Collection created: ${currentCollection!.id}`);
  } else {
    throw new Error('Unable to get the collection info');
  }

  // Start the progress bar
  progressBar.start(documents.length, 0);

  // Start the batch embedding process and the timer
  const startTime = performance.now();

  const batches = sliceIntoChunks(documents, BATCH_SIZE);
  for (const batch of batches) {
    const vectors = await currentCollection?.addText(batch);
    if (!vectors) {
      throw new Error('Unable to create vectors');
    }
    counter += batch.length;
    progressBar.update(counter);
  }

  // Stop the timer
  const endTime = performance.now();
  // Stop the progress bar
  progressBar.stop();

  // Calculate the duration in milliseconds
  const duration = endTime - startTime;

  // Log the duration
  console.log(`Process duration: ${duration} milliseconds`);

  console.log(
    `Inserted ${documents.length} documents into index ${collectionName}`
  );
};

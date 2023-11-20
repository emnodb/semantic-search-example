/* eslint no-console: 0 -- we are allowing it */
import { performance } from 'node:perf_hooks';
import cliProgress from 'cli-progress';
import { config } from 'dotenv';
import loadCSVFile from './csvLoader';
import { Emno } from './emno/index';
import { embedder } from './embeddings';
import { getEnv, validateEnvironmentVariables } from './utils/util';

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

  // Get a Emno instance
  const emno = new Emno({
    token: getEnv('EMNO_TOKEN'),
  });

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
  // For loading everything uncomment the following:
  //   const documents = data.map((row) => row[column] as string);

  // Get collection name name
  const collectionName = getEnv('EMNO_COLLECTION');

  // Check whether the collection already exists. If it doesn't, create
  // an emno collection with a dimension of 384 to hold the outputs
  // of our embeddings model.
  let collection = await emno.getCollection(collectionName);
  if (!collection) {
    // create one
    collection = await emno.createCollection({
      name: collectionName,
      config: {
        dim: 384,
        m: 10,
        efConstruction: 100,
        ef: 100,
        model: 'test-model',
        algo: 'cosine',
      },
    });
  }

  // Select the correct Emno collection
  const emCollection = await emno.getCollection(collectionName);
  console.log(emCollection);

  if (!emCollection?.id) {
    throw new Error('Unable to get the collection info');
  }

  // Start the progress bar
  progressBar.start(documents.length, 0);

  // Start the batch embedding process
  // Start the timer
  const startTime = performance.now();

  await embedder.init();
  await embedder.emEmbedBatch(documents, BATCH_SIZE, async (embeddings) => {
    counter += embeddings.length;
    // Whenever the batch embedding process returns a batch of embeddings, insert them into the index
    await emno.addVectors(emCollection.id || '', embeddings);
    progressBar.update(counter);
  });

  progressBar.stop();
  // Stop the timer
  const endTime = performance.now();

  // Calculate the duration in milliseconds
  const duration = endTime - startTime;

  // Log the duration
  console.log(`Process duration: ${duration} milliseconds`);

  console.log(
    `Inserted ${documents.length} documents into index ${collectionName}`
  );
};

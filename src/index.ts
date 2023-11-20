/* eslint-disable @typescript-eslint/no-unsafe-argument -- needed */
/* eslint-disable no-console -- needed*/
/* eslint-disable @typescript-eslint/no-shadow -- needed */
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { load } from './load';
import { query as queryCommand } from './query';
import { deleteCollection } from './deleteCollection';

export const run = async () => {
  const parser = yargs(hideBin(process.argv))
    .scriptName('semanticSearchExample')
    .demandCommand(1)
    // Configure load command
    .command({
      command: 'load',
      aliases: ['l'],
      describe: 'Load the embeddings in to Emno',
      builder: (yargs) =>
        yargs
          .option('csvPath', {
            alias: 'p',
            type: 'string',
            description: 'Path to your CSV path',
            demandOption: true,
          })
          .option('column', {
            alias: 'c',
            type: 'string',
            description: 'The name for the CSV column',
            demandOption: true,
          }),
      handler: async (argv) => {
        const { csvPath, column } = argv;

        if (!csvPath) {
          console.error('Please provide a CSV path');
          process.exit(1);
        }

        await load(csvPath, column);
      },
    })
    // Configure query command
    .command({
      command: 'query',
      aliases: ['q'],
      describe: 'Query Emno DB',
      builder: (yargs) =>
        yargs
          .option('query', {
            alias: 'q',
            type: 'string',
            description: 'Your query',
            demandOption: true,
          })
          .option('topK', {
            alias: 'k',
            type: 'number',
            description: 'number of results to return',
            demandOption: true,
          }),
      handler: async (argv) => {
        const { query, topK } = argv;
        if (!query) {
          console.error('Please provide a query');
          process.exit(1);
        }

        await queryCommand(query, topK);
      },
    })
    // Configure delete command
    .command({
      command: 'delete',
      aliases: ['d'],
      describe: 'Delete Emno Collection',
      handler: async () => {
        await deleteCollection();
      },
    });

  parser.exit = (number) => {
    throw new Error(`Parser, process.exit: ${number}`);
  };

  // Parse query command
  return parser.parse();
};

run().catch((e) => {
  console.error(e);
});

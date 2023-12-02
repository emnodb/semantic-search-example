/* eslint-disable @typescript-eslint/restrict-template-expressions -- needed */
/* eslint-disable no-console -- needed */
import { config } from 'dotenv';
import { getEnv, validateEnvironmentVariables } from './utils/util';
import { Emno } from '@emno/sdk';

config();
validateEnvironmentVariables();

export const deleteCollection = async () => {
  const collectionName = getEnv('EMNO_COLLECTION');

  const emno = new Emno({
    token: getEnv('EMNO_TOKEN'),
    shouldThrow: true,
    logErrors: true,
  });

  try {
    const result = await emno.deleteCollection(collectionName);
    console.log(`Deleted: ${result?.id}-${result?.name}`);
  } catch (e) {
    console.error(e?.toString());
  }
};

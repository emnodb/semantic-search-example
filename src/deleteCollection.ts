/* eslint-disable unicorn/filename-case -- needed */
/* eslint-disable @typescript-eslint/restrict-template-expressions -- needed */
/* eslint-disable no-console -- needed */
import { config } from 'dotenv';
import { getEnv, validateEnvironmentVariables } from './utils/util';
import { Emno } from './emno/index';

config();
validateEnvironmentVariables();

export const deleteCollection = async () => {
  const collectionName = getEnv('EMNO_COLLECTION');

  const emno = new Emno({
    token: getEnv('EMNO_TOKEN'),
  });

  try {
    const result = await emno.deleteCollection(collectionName);
    console.log(`Deleted: ${result?.deleted}`);
  } catch (e) {
    console.error(e?.toString());
  }
};

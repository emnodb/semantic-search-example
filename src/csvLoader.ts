/* eslint-disable unicorn/filename-case -- needed */
/* eslint-disable import/no-default-export -- needed*/
/* eslint-disable no-console -- needed */
/* eslint-disable @typescript-eslint/await-thenable -- needed */
import fs from 'node:fs/promises';
import Papa from 'papaparse';

async function loadCSVFile(
  filePath: string
): Promise<Papa.ParseResult<Record<string, unknown>>> {
  try {
    // Get csv file absolute path
    const csvAbsolutePath = await fs.realpath(filePath);

    // Create a readable stream from the CSV file
    const data = await fs.readFile(csvAbsolutePath, 'utf8');

    // Parse the CSV file
    return await Papa.parse(data, {
      dynamicTyping: true,
      header: true,
      skipEmptyLines: true,
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export default loadCSVFile;

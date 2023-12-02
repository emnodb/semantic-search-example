const sliceIntoChunks = (inputArray: string[], chunkSize: number) => {
  // modify to api's required format
  const arr = inputArray.map((s) => {
    return {
      content: s,
    };
  });
  return Array.from({ length: Math.ceil(arr.length / chunkSize) }, (_, i) =>
    arr.slice(i * chunkSize, (i + 1) * chunkSize)
  );
};

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} environment variable not set`);
  }
  return value;
}

const validateEnvironmentVariables = () => {
  getEnv('EMNO_COLLECTION');
  getEnv('EMNO_TOKEN');
};

export { getEnv, sliceIntoChunks, validateEnvironmentVariables };

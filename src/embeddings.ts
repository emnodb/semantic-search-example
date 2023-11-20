/* eslint-disable @typescript-eslint/no-unsafe-member-access -- needed*/
/* eslint-disable @typescript-eslint/no-unsafe-assignment -- needed*/
/* eslint-disable @typescript-eslint/no-unsafe-argument -- needed*/
/* eslint no-await-in-loop:0 -- we need this */
import type { Pipeline } from '@xenova/transformers';
import { sliceIntoChunks } from './utils/util';
import type { VectorCreateType } from './emno/index';

class Embedder {
  private pipe: Pipeline | null = null;

  // Initialize the pipeline
  async init() {
    const { pipeline } = await import('@xenova/transformers');
    this.pipe = await pipeline('embeddings', 'Xenova/all-MiniLM-L6-v2');
  }

  async emEmbed(text: string): Promise<VectorCreateType> {
    const result = this.pipe && (await this.pipe(text));
    const vector: VectorCreateType = {
      values: Array.from(result.data),
      metadata: { sample1: 'newSampleKey2' },
      content: text,
    };
    return vector;
  }
  // Batch an array of string and embed each batch
  // Call onEmDoneBatch with the embeddings of each batch
  async emEmbedBatch(
    texts: string[],
    batchSize: number,
    onEmDoneBatch: (embeddings: VectorCreateType[]) => Promise<void>
  ) {
    const batches = sliceIntoChunks<string>(texts, batchSize);
    for (const batch of batches) {
      const vectors = await Promise.all(
        batch.map((text) => this.emEmbed(text))
      );
      await onEmDoneBatch(vectors);
    }
  }
}

const embedder = new Embedder();

export { embedder };

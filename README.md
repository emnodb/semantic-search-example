# Semantic Search Example

> Adapted from [pinecone's semantic search example](https://github.com/pinecone-io/semantic-search-example)

In this walkthrough we will see how to use Emno for semantic search.

## Setup

Prerequisites:
- `Node.js` version >=18.0.0

Clone the repository and install the dependencies.

```
npm install
```

### Configuration

In order to run this example, you have to supply the Emno credentials needed to interact with the Emno API. You can find these credentials in the Emno's web console. This project uses `dotenv` to easily load values from the `.env` file into the environment when executing.

Copy the template file:

```sh
cp .env.example .env
```

And fill in your API key and environment details:

```sh
EMNO_TOKEN=mydummytoken
EMNO_COLLECTION=semantic-search-try
```

`EMNO_COLLECTION` is the name of the collection where this demo will store and query vectors. You can change `EMNO_COLLECTION` to any name you like, but make sure the name not going to collide with any collection that you are already using.


## Application structure

There are two main components to this application: the data loader (load.ts) and the search engine (query.ts). The data loader is responsible for loading the data into Emno. The search engine is responsible for querying the index and returning similar results. These two components share a common modules, the `embedder`, which transforms natural language strings into embeddings using the [`sentence-transformers/all-MiniLM-L6-v2`](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) model.

## Data Preprocessing

The data loading process starts with the CSV file. This file contains the articles that will be indexed and made searchable. To load this data, the project uses the `papaparse` library. The loadCSVFile function in `csvLoader.ts` reads the file and uses `papaparse` to parse the CSV data into JavaScript objects. The `dynamicTyping` option is set to true to automatically convert the data to the appropriate types. After this step, you will have an array of objects, where each object represents an article​.

See: [csvLoader.ts](./src/csvLoader.ts)

## Building embeddings

The text embedding operation is performed in the `Embedder` class. This class uses a pipeline from the [`@xenova/transformers`](https://github.com/xenova/transformers.js) library to generate embeddings for the input text. We use the [`sentence-transformers/all-MiniLM-L6-v2`](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) model to generate the embeddings. The class provides methods to embed a single string or an array of strings in batches​ - which will come in useful a bit later.

You can find the source here: [embeddings.ts](./src/embeddings.ts)



## Loading embeddings into Emno

Now that we have a way to load data and create embeddings, let put the two together and save the embeddings in Emno. In the following section, we get the path of the file we need to process from the command like. We load the CSV file, create the Emno collection and then start the embedding process. The embedding process is done in batches of 100. Once we have a batch of embeddings, we insert them into the index.

See: [load.ts](./src/load.ts)

To run the script for loading data into emno database, use the following command:

```sh
npm run load -- --csvPath=<path-to-csv-file> --column=<column-name>
```

To test our search engine, we'll use the `test-full.csv` found in the same repo. This file has two columns (`question1` and `question2`) which include similar questions.

To index both columns, we'll run:

```sh
npm run load -- --csvPath=test-full.csv --column=question1
```

and

```sh
npm run load -- --csvPath=test-full.csv --column=question2
```



## Making queries

Now that our index is populated we can begin making queries. We are performing a semantic search for similar questions, so we should embed and search with another question.

See: [query.ts](./src/query.ts)



The querying process is very similar to the indexing process. We create an Emno client, select the index we want to query, and then embed the query. We then use the `query` method to search the index for the most similar embeddings. The `query` method returns a list of matches. Each match contains the metadata associated with the embedding, as well as the score of the match.

Let's run some queries and see what we get:

```sh
npm run query -- --query="which city has the highest population in the world?" --topK=2
```

The result for this will be something like:

```js
[
  {
    text: 'Which country in the world has the largest population?',
    distance: 0.2139432430267334
  },
  {
    text: 'Which is the most country on earth?',
    distance: 0.33329665660858154
  }
]
```

These are clearly very relevant results. All of these questions either share the exact same meaning as our question, or are related. We can make this harder by using more complicated language, but as long as the "meaning" behind our query remains the same, we should see similar results.

```sh
 npm run query -- --query="which urban locations have the highest concentration of homo sapiens?" --topK=2
```

And the result:

```js
[
  {
    text: 'What cities in world should I live in or visit?',
    distance: 0.49526894092559814
  },
  {
    text: 'What is word reason for the high population density in Chennai?',
    distance: 0.5257517099380493
  }
]
```

Here we used very different language with completely different terms in our query than that of the returned documents. We substituted "city" for "urban location" and "populated" for "concentration of homo sapiens".

Despite these very different terms and lack of term overlap between query and returned documents — we get highly relevant results — this is the power of semantic search.

You can go ahead and ask more questions above. When you're done, delete the index to save resources:

```sh
npm start -- delete
```

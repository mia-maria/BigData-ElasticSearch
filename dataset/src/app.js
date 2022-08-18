import { Client } from '@elastic/elasticsearch'
import 'dotenv/config'
import pkg from 'csv-parser'
import * as fs from 'fs'

/**
 * The main function of the application.
 */
const startApp = async () => {
  // Establish a connection to ElasticSearch
  /* const client = new Client({
    node: 'https://localhost:9200',
    auth: {
      username: process.env.ELASTIC_USER,
      password: process.env.ELASTIC_PASSWORD
    },
    tls: {
      ca: process.env.FINGERPRINT,
      rejectUnauthorized: false
    }
  }) */
  // Establish a connection to ElasticSearch on the cloud.
  const client = new Client({
    cloud: {
      id: process.env.CLOUD_ID
    },
    auth: {
      username: 'elastic',
      password: process.env.CLOUD_PASSWORD
    }
  })
  // Dataset from https://www.kaggle.com/datasets
  parseFile(client, 'MysteryBooks.csv')
}

/**
 * Parse csv file.
 *
 * @param {client} client - the elastic search client.
 * @param {csvFile} csvFile - the csvfile that will be parsed.
 */
async function parseFile (client, csvFile) {
  const csv = pkg
  const result = []
  fs.createReadStream(csvFile)
    .pipe(csv())
    .on('data', (data) => result.push(data))
    .on('end', () => {
      for (const book of result) {
        book.book_rank = parseInt(book.book_rank)
        book.id = parseInt(book.id)
        book.publication_year = parseInt(book.publication_year)
        book.num_pages = parseInt(book.num_pages)
        book.average_rating = parseInt(book.average_rating)
        book.ratings_count = parseInt(book.ratings_count)
        book.date = new Date()
      }
      saveData(client, result)
    })
}

/**
 * Save data.
 *
 * @param {client} client - the elastic search client.
 * @param {dataset} dataset - the data that will be saved.
 */
async function saveData (client, dataset) {
  await client.indices.create({
    index: 'mysterybooks',
    operations: {
      mappings: {
        properties: {
          book_rank: { type: 'integer' },
          id: { type: 'integer' },
          title: { type: 'keyword' },
          book_author: { type: 'keyword' },
          publication_year: { type: 'integer' },
          publisher: { type: 'text' },
          language_code: { type: 'text' },
          num_pages: { type: 'integer' },
          average_rating: { type: 'integer' },
          ratings_count: { type: 'integer' },
          date: { type: 'date' }
        }
      }
    }
  }, { ignore: [400] })

  const operations = dataset.flatMap(doc => [{ index: { _index: 'mysterybooks' } }, doc])

  const bulkResponse = await client.bulk({ refresh: true, operations })

  if (bulkResponse.errors) {
    console.log(bulkResponse.errors)
  }

  const count = await client.count({ index: 'mysterybooks' })
  console.log(count)
}

startApp().catch(console.log)

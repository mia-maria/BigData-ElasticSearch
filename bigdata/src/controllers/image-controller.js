/**
 * Image Controller.
 *
 * @author Mia-Maria Galistel <mg223tj@student.lnu.se>
 * @version 1.0.0
 */

 import { Client } from '@elastic/elasticsearch'
 import 'dotenv/config'
 import GoogleChartsNode from 'google-charts-node'

/**
 * Represents an image-controller.
 */
 export class ImageController {
  /**
   * Establishes a connection to ElasticSearch and creates a graph.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async process (req, res, next) {
    try {
      // Establish a connection to ElasticSearch
      const client = new Client({
        cloud: {
          id: process.env.CLOUD_ID
        },
        auth: {
          username: 'elastic',
          password: process.env.CLOUD_PASSWORD
        }
      })
      // Alternative connection to ElasticSearch
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
      let result = await client.sql.query({
        query: "SELECT book_author, SUM(num_pages) FROM \"mysterybooks\" GROUP BY book_author ORDER BY SUM(num_pages)DESC LIMIT 10"
      })
      result = result.rows
      // Create a graph. Based on example code in google-charts-node documentation.
      const drawChartStr = `
        // Create a data table.
        const data = new google.visualization.DataTable()
        data.addColumn('string', 'Author')
        data.addColumn('number', 'Number of pages')
        data.addRows([
          ['${result[0][0]}', ${result[0][1]}],
          ['${result[1][0]}', ${result[1][1]}],
          ['${result[2][0]}', ${result[2][1]}],
          ['${result[3][0]}', ${result[3][1]}],
          ['${result[4][0]}', ${result[4][1]}],
          ['${result[5][0]}', ${result[5][1]}],
          ['${result[6][0]}', ${result[6][1]}],
          ['${result[7][0]}', ${result[7][1]}],
          ['${result[8][0]}', ${result[8][1]}],
          ['${result[9][0]}', ${result[9][1]}],
        ])
  
          const options = { title: 'Top 10 - Number of pages the authors have written' }
          // Instantiate and draw the chart.
          const chart = new google.visualization.LineChart(document.getElementById('chart_div'))
          chart.draw(data, options)
        `
    
      // Renders an image of the chart
      let image = await GoogleChartsNode.render(drawChartStr, {
        width: 900,
        height: 700,
      })
      image = Buffer.from(image, 'base64')
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': image.length
      })
      res.end(image)
      } catch (error) {
        console.log(error)
        next(error)
    }
  }
}
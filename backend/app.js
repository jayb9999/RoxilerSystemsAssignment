const express = require('express')
const sqlite3 = require('sqlite3')
const axios = require('axios')

const app = express()
const PORT = 3000
app.use(express.json())

// Initialize SQLite database
const db = new sqlite3.Database('./transactionsDB.db')

db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY,
            title TEXT,
            price INTEGER,
            description TEXT,
            category TEXT,
            image TEXT,
            sold BOOLEAN,
            dateOfSale DATETIME
        )
    `)

// Initialize the database with seed data from the third-party API
const initializeDatabase = async () => {
  try {
    const response = await axios.get(
      'https://s3.amazonaws.com/roxiler.com/product_transaction.json',
    )
    const data = response.data

    for (let item of data) {
      const existingRecord = await new Promise((resolve, reject) => {
        db.get(
          'SELECT id FROM transactions WHERE id = ?',
          [item.id],
          (err, row) => {
            if (err) {
              reject(err)
            } else {
              resolve(row)
            }
          },
        )
      })

      if (!existingRecord) {
        const query = `
          INSERT INTO transactions (id, title, price, description, category, image, sold, dateOfSale) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `
        await db.run(query, [
          item.id,
          item.title,
          item.price,
          item.description,
          item.category,
          item.image,
          item.sold,
          item.dateOfSale,
        ])
      }
    }
    console.log('Database initialized with seed data.')
  } catch (error) {
    console.error('Error initializing database: ', error.message)
  }
}
initializeDatabase()

/* // API to initialize the database
app.get('/initialize-database/', async (req, res) => {
  await initializeDatabase()
  res.send('Database initialized with seed data.')
}) */

// API to list all transactions with search and pagination support
app.get('/transactions/', async (req, res) => {
  let {page = 1, perPage = 10, search = ''} = req.query
  page = parseInt(page)
  perPage = parseInt(perPage)
  const offset = (page - 1) * perPage

  let query = `
    SELECT * FROM transactions 
    WHERE title LIKE '%${search}%' OR description LIKE '%${search}%' OR price LIKE '%${search}%'
    LIMIT ${perPage} OFFSET ${offset}
  `

  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({error: err.message})
      return
    }
    res.json(rows)
  })
})

// API for statistics
app.get('/statistics/', async (req, res) => {
  const {month} = req.query
  const query = `
    SELECT SUM(CASE WHEN sold = 1 THEN price ELSE 0 END) AS totalSaleAmount, 
           COUNT(CASE WHEN sold = 1 THEN 1 END) AS totalSoldItems,
           COUNT(CASE WHEN sold = 0 THEN 1 END) AS totalNotSoldItems
    FROM transactions
    WHERE strftime('%m', dateOfSale) = '${month}';
  `

  db.get(query, (err, row) => {
    if (err) {
      res.status(500).json({error: err.message})
      return
    }
    res.json({
      totalSaleAmount: row.totalSaleAmount || 0,
      totalSoldItems: row.totalSoldItems || 0,
      totalNotSoldItems: row.totalNotSoldItems || 0,
    })
  })
})

// API for bar chart
app.get('/bar-chart/', async (req, res) => {
  const {month} = req.query
  const queries = [
    {
      range: '0 - 100',
      query: `SELECT COUNT(*) AS count FROM transactions WHERE price >= 0 AND price <= 100 AND strftime('%m', dateOfSale) = '${month}'`,
    },
    {
      range: '101 - 200',
      query: `SELECT COUNT(*) AS count FROM transactions WHERE price >= 101 AND price <= 200 AND strftime('%m', dateOfSale) = '${month}'`,
    },
    {
      range: '201 - 300',
      query: `SELECT COUNT(*) AS count FROM transactions WHERE price >= 201 AND price <= 300 AND strftime('%m', dateOfSale) = '${month}'`,
    },
    {
      range: '301 - 400',
      query: `SELECT COUNT(*) AS count FROM transactions WHERE price >= 301 AND price <= 400 AND strftime('%m', dateOfSale) = '${month}'`,
    },
    {
      range: '401 - 500',
      query: `SELECT COUNT(*) AS count FROM transactions WHERE price >= 401 AND price <= 500 AND strftime('%m', dateOfSale) = '${month}'`,
    },
    {
      range: '501 - 600',
      query: `SELECT COUNT(*) AS count FROM transactions WHERE price >= 501 AND price <= 600 AND strftime('%m', dateOfSale) = '${month}'`,
    },
    {
      range: '601 - 700',
      query: `SELECT COUNT(*) AS count FROM transactions WHERE price >= 601 AND price <= 700 AND strftime('%m', dateOfSale) = '${month}'`,
    },
    {
      range: '701 - 800',
      query: `SELECT COUNT(*) AS count FROM transactions WHERE price >= 701 AND price <= 800 AND strftime('%m', dateOfSale) = '${month}'`,
    },
    {
      range: '801 - 900',
      query: `SELECT COUNT(*) AS count FROM transactions WHERE price >= 801 AND price <= 900 AND strftime('%m', dateOfSale) = '${month}'`,
    },
    {
      range: '901 - above',
      query: `SELECT COUNT(*) AS count FROM transactions WHERE price >= 901 AND strftime('%m', dateOfSale) = '${month}'`,
    },
  ]
  const promises = queries.map(({range, query}) => {
    return new Promise((resolve, reject) => {
      db.get(query, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve({range, count: row.count})
        }
      })
    })
  })
  Promise.all(promises)
    .then(results => {
      res.json(results)
    })
    .catch(err => {
      console.error('Error executing SQL Queries: ', err)
      res.status(500).json({error: 'Internal server error'})
    })
})

// API for pie chart
app.get('/pie-chart/', async (req, res) => {
  const {month} = req.query
  const query = `
    SELECT category, COUNT(*) AS itemCount
    FROM transactions
    WHERE strftime('%m', dateOfSale) = '${month}'
    GROUP BY category
    ORDER BY category;
  `

  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({error: err.message})
      return
    }
    res.json(rows)
  })
})

// API to fetch combined data from all APIs
app.get('/combined-data/', async (req, res) => {
  const {month} = req.query
  try {
    const transactions = await axios.get(
      `http://localhost:3000/transactions?month=${month}`,
    )
    const statistics = await axios.get(
      `http://localhost:3000/statistics?month=${month}`,
    )
    const barChart = await axios.get(
      `http://localhost:3000/bar-chart?month=${month}`,
    )
    const pieChart = await axios.get(
      `http://localhost:3000/pie-chart?month=${month}`,
    )

    const combinedData = {
      //transactions: transactions.data,
      statistics: statistics.data,
      barChart: barChart.data,
      pieChart: pieChart.data,
    }

    res.json(combinedData)
  } catch (error) {
    res.status(500).json({error: error.message})
  }
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port '${PORT}'`)
})

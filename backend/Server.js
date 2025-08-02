const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')

const authRouter = require('./Router/authRouter')
const mainRouter = require('./Router/mainRouter')
const { connection } = require('./config/config')
const db = require('./models')
const { checkDatabase } = require('./Controller/Database/CheckDatabase')

dotenv.config()

// Initialize database connection
const initializeDatabase = async () => {
  try {
    await connection()
    await db.sequelize.sync({ alter: true }) // This will create/update tables
    console.log('Database synchronized successfully')
  } catch (error) {
    console.error('Database initialization failed:', error)
    process.exit(1)
  }
}

initializeDatabase()

const app = express()

app.use(cors({
  origin: [
    'http://localhost:8080',
    'https://moovo.netlify.app',
    'https://www.moovo.netlify.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
  credentials: true,
  optionsSuccessStatus: 200
}))

app.use(express.json({ limit: '10mb' }))

// Database check route
app.get('/api/check-database', checkDatabase)

app.use('/api/auth', authRouter)
app.use('/api/adminportal', mainRouter)

// Global validation error handler
app.use((err, req, res, next) => {
    // Handle JSON parsing errors
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            success: false,
            message: 'Invalid JSON format in request body'
        });
    }
    
    // Handle payload too large errors
    if (err.type === 'entity.too.large') {
        return res.status(413).json({
            success: false,
            message: 'Request payload too large'
        });
    }
    
    console.error(err.stack)
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server started on port ${PORT}`))

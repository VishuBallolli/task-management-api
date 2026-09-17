const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/database');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Task Management API is running' });
});

app.use('/tasks', taskRoutes);

async function startServer() {
  try {
    const connection = await pool.getConnection();

    console.log('MySQL connected successfully');

    connection.release();

    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error('MySQL connection failed:', error.message);
  }
}

startServer();
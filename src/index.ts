import express from 'express'
import diaryRouter from './routes/diaries'

import cluster from 'cluster'
import process from 'process'
import os from 'os'

const cpus = os.cpus

const numCPUs = cpus().length

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`)

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }
} else {
  const app = express()
  app.use(express.json())

  const PORT = 3000

  app.get('/ping', (_req, res) => {
    console.log('Funciona')
    res.send('pong')
  })

  app.use('/api/diaries', diaryRouter)

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} on worker with PID ${process.pid}`)
  })
}

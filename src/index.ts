import express from 'express'
import diaryRouter from './routes/diaries'
import 'newrelic'
import cluster from 'cluster'
import process from 'process'
import os from 'os'

const numCPUs = os.cpus().length

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`)

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker, _code, _signal) => {
    if (worker.process.pid != null) console.log(`worker ${worker.process.pid} died`)
  })
} else {
  const app = express()
  app.use(express.json())

  const PORT = 3000

  app.get('/ping', (_req, res) => {
    if (cluster.worker != null) {
      const worker = cluster.worker.id
      res.send(`Running on worker with id ==> ${worker}`)
    } else {
      res.send('Cluster not available')
    }
  })

  app.use('/api/diaries', diaryRouter)

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} on worker with PID ${process.pid}`)
  })
}

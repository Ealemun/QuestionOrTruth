import express from 'express'
import bodyParser from 'body-parser'
import { GameSession } from './engineWrapper'
import { StepInput } from './types'

const START_PORT = 3003
const NUM_SERVERS = 6

for (let i = 0; i < NUM_SERVERS; i++) {
  const port = START_PORT + i
  const app = express()
  app.use(bodyParser.json())

  const session = new GameSession()

  app.get('/', (_, res) => res.send(`Server running on port ${port}`))

  app.post('/reset', (_, res) => {
    const output = session.reset()
    res.json(output)
  })

  app.post('/step', (req, res) => {
    const input = req.body as StepInput
    try {
      const output = session.step(input)
      res.json(output)
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  })

  app.listen(port, () => {
    console.log(`🟢 Server listening on http://localhost:${port}`)
  })
}

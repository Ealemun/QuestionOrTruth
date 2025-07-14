import express from 'express'
import bodyParser from 'body-parser'
import { GameSession } from './engineWrapper'
import { StepInput } from './types'

const app = express()
const port = 3001

app.use(bodyParser.json())

const session = new GameSession()

app.post('/reset', (req, res) => {
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
  console.log(`Headless game server listening on port ${port}`)
})

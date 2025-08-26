import express from 'express'          // -> ES Module
import { checkDbConnection } from './database.js'

const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})


checkDbConnection().then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server listening on port ${port}`);
    });
  });
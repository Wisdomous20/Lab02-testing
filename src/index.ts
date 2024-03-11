import express from 'express';
import { Pool } from 'pg'

export const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: 5432
})

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/pogs', async (_, res) => {
  try {
    const db = pool.connect();
    const result = await (await db).query('SELECT * FROM pogs');
    if (result.rows.length === 0) {
    res.status(400).send('pogs not found')
    }else{
      res.status(200).json(result.rows);
    }
  } catch(e) {
    console.error(e)
    res.status(404).send('Not found')
  }
})

app.get('/pogs/:id', async (req, res) => {
  try {
    const db = pool.connect();
    const id = req.params.id;
    const result = await (await db).query('SELECT * FROM pogs WHERE pogs_id = $1', [id]);
    if(result.rows.length === 0) {
      res.status(404).send('pogs not found')
    }else{
      res.status(200).json(result.rows);

    }
  } catch(e) {
    console.error(e)
    res.status(404).send('Not found')
  }
})

app.post('/pogs', async (req, res) => {
  try {
    const db = pool.connect();
    const { pogs_name, ticker_symbol, price, color } = req.body;
    if(!pogs_name || !ticker_symbol || !price || !color){
      res.status(422).send('POST failed')
    }else{
      const result = await (await db).query('INSERT INTO pogs (pogs_name, ticker_symbol, price, color) VALUES ($1, $2, $3, $4) RETURNING *', 
      [pogs_name, ticker_symbol, price, color]);
      res.status(200).json(result.rows);
    }
  } catch(e) {
    console.error(e)
    res.status(404).send('Not found')
  }
})

app.put('/pogs/:id', async (req, res) => {
  try {
    const { pogs_name, ticker_symbol, price, color } = req.body;
    const id = req.params.id;
    if(!pogs_name || !ticker_symbol || !price || !color){
      res.status(422).send('Edit failed')
    } else {
      const db = await pool.connect();
      const idCheck = await db.query('SELECT * FROM pogs WHERE pogs_id = $1', [id]);
      if(idCheck.rows.length === 0){
        res.status(404).send('pogs not found')
      }else{
        const result = await db.query('UPDATE pogs SET pogs_name = $1, ticker_symbol = $2, price = $3, color = $4 WHERE pogs_id = $5 RETURNING *',
        [pogs_name, ticker_symbol, price, color, id]);
        res.status(200).json(result.rows);
      }
    }
  } catch(e) {
    console.error(e)
    res.status(500).send('internal server error')
  }
})

app.delete('/pogs/:id', async (req, res) => {
  try {
    const db = await pool.connect();
    const idCheck = await db.query('SELECT * FROM pogs WHERE pogs_id = $1', [req.params.id]);
    if(idCheck.rows.length === 0){
      res.status(404).send('pogs not found')
    }else{
    const result = await db.query('DELETE FROM pogs WHERE pogs_id = $1 RETURNING *', [req.params.id]);
    res.status(200).json(result.rows);
    }
  } catch(e) {
    console.error(e)
    res.status(500).send('Not found')
  }
})

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})

export default app;
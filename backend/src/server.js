import 'dotenv/config';
import { app } from './app.js';
import { initializeDatabase } from './db/database.js';

const port = Number(process.env.PORT || 3333);

initializeDatabase();

app.listen(port, () => {
  console.log(`AY Hub API rodando em http://localhost:${port}`);
});

import 'dotenv/config';
import app from './app.js';
import { conectarDB } from './config/db.js';

const PORT = process.env.PORT || 4000;

for (const variable of ['MONGO_URI', 'JWT_SECRET']) {
  if (!process.env[variable]) {
    console.error(`Falta la variable ${variable} en .env`);
    process.exit(1);
  }
}

try {
  await conectarDB();
  app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));
} catch (err) {
  console.error('No se pudo iniciar el servidor:', err.message);
  process.exit(1);
}

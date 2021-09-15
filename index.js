const express = require('express');
const config = require('config');
const cors = require('cors');
const sequelize = require('./db/db');
const routes = require('./routes/index');

const app = express();
const PORT = config.get('PORT') || 3000;

app.use(express.json());
app.use(cors());

app.use(routes);

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () => console.log(`App started - ${PORT}`));
  } catch (e) {
    console.log(e);
  } 
};

start();

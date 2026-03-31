// app.js
const express = require('express');
const app = express();

// Middleware CORS - Autorise les requêtes depuis Angular
app.use((req, res, next) => {
  const origin = req.headers.origin;
  // Autoriser les appels navigateur depuis localhost ou IP reseau.
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  
  // Répondre aux requêtes OPTIONS
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Routes
app.use('', require('./routes/auth'));
app.use('/medecins', require('./routes/medecin'));
app.use('/rapports', require('./routes/report'));
app.use('/medicaments', require('./routes/medicine'));



const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server on port ${port}`);
});
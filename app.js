// app.js
const express = require('express');
const app = express();
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
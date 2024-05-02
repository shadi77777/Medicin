const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('.')); // Serverer statiske filer fra rodmappen

app.listen(port, () => {
    console.log(`Server lytter på http://localhost:${port}`);
});

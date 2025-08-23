const app = require('./src/app');
const PORT = process.env.PORT || 4000;

app.get('/', (_req, res) => res.send('OK')); // ping minimal

app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
});
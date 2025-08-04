const app = require('./src/app');

const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => {
    res.send('API is running');
});

app.listen(PORT, async () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});

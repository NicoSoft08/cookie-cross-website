const app = require('./src/app');
const { main } = require('./src/scripts');

const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => {
    res.send('API is running');
});

app.listen(PORT, async () => {
    // await main(); // Initialize mock data if needed
    console.log(`Server is running on port http://localhost:${PORT}`);
});

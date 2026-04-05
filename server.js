require('dotenv').config();
const app = require('./src/app');
const http = require('http');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});
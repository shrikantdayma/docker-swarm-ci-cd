// app.js: Simple Node.js application with a visit counter stored in a volume
const http = require('http');
const fs = require('fs');

// Define the path where the visit count will be stored (on the Docker Volume)
const COUNT_FILE = '/data/visits.txt';
let visitCount = 0;

// Function to read the count from the persistent volume
function loadCount() {
    try {
        // Read existing count from the volume mount point
        const data = fs.readFileSync(COUNT_FILE, 'utf8');
        visitCount = parseInt(data) || 0;
        console.log(`Loaded initial visit count: ${visitCount}`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('Count file not found. Starting count at 0.');
            saveCount(); // Create the file initially
        } else {
            console.error('Error loading count:', error.message);
        }
    }
}

// Function to save the count to the persistent volume
function saveCount() {
    try {
        // Write the current count to the volume mount point
        fs.writeFileSync(COUNT_FILE, visitCount.toString(), 'utf8');
        console.log(`Saved new visit count: ${visitCount}`);
    } catch (error) {
        console.error('Error saving count:', error.message);
    }
}

// Load the count immediately when the app starts
loadCount();

const server = http.createServer((req, res) => {
    visitCount++;
    saveCount();
    
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`Hello from Docker Swarm! This service has been visited ${visitCount} times. (Count is persistent via Docker Volume /data/visits.txt)\n`);
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});

// Handle graceful shutdown (important for Swarm/Docker)
process.on('SIGINT', () => {
    console.log('Caught interrupt signal. Saving final count...');
    saveCount();
    process.exit();
});


const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const port = 8080;

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Enable CORS for API requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`Incoming request: ${req.method} ${pathname}`); // Debug logging

  // Route handling - Fixed routing logic
  let filePath;
  if (pathname === "/" || pathname === "/index.html") {
    filePath = path.join(__dirname, "index.html");
  } else if (pathname === "/add") {
    filePath = path.join(__dirname, "add.html");
  } else {
    filePath = path.join(__dirname, pathname);
  }

  const extname = path.extname(filePath);
  const contentType = mimeTypes[extname] || "application/octet-stream";

  console.log(`Serving file: ${filePath}`); // Debug logging

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === "ENOENT") {
        // File not found - serve 404 page
        console.log(`File not found: ${filePath}`);
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>404 - Page Not Found</title>
                        <style>
                            body { 
                                font-family: Arial, sans-serif; 
                                text-align: center; 
                                padding: 50px; 
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: white;
                                min-height: 100vh;
                                margin: 0;
                                display: flex;
                                flex-direction: column;
                                justify-content: center;
                            }
                            h1 { color: white; font-size: 3rem; margin-bottom: 1rem; }
                            p { font-size: 1.2rem; margin-bottom: 2rem; }
                            a { 
                                color: #fbbf24; 
                                text-decoration: none; 
                                font-weight: bold;
                                padding: 1rem 2rem;
                                border: 2px solid #fbbf24;
                                border-radius: 8px;
                                display: inline-block;
                                transition: all 0.3s ease;
                            }
                            a:hover {
                                background: #fbbf24;
                                color: #764ba2;
                                transform: translateY(-2px);
                            }
                        </style>
                    </head>
                    <body>
                        <h1>404 - Page Not Found</h1>
                        <p>The page you're looking for doesn't exist.</p>
                        <p>Tried to serve: ${filePath}</p>
                        <a href="/">← Back to Home</a>
                    </body>
                    </html>
                `);
      } else {
        // Server error
        console.log(`Server error: ${err.code}`);
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success
      console.log(`Successfully served: ${filePath}`);
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content);
    }
  });
});

server.listen(port, () => {
  console.log(`🎵 JamLyrics server running at http://localhost:${port}`);
  console.log(`📁 Serving files from: ${__dirname}`);
  console.log(`🔗 Homepage: http://localhost:${port}`);
  console.log(`🔗 Add page: http://localhost:${port}/add`);
  console.log(`📝 Available files:`);
  console.log(`   - index.html`);
  console.log(`   - add.html`);
  console.log(`   - styles.css`);
  console.log(`   - script.js`);
  console.log(`   - add-script.js`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

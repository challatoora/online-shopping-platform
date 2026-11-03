const http = require("http");
const fs = require("fs");
const path = require("path");

const server = http.createServer((req, res) => {
    const filePath = path.join(__dirname, "index.html");

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(500);
            res.end("Unable to load website");
            return;
        }

        res.writeHead(200, {
            "Content-Type": "text/html"
        });

        res.end(content);
    });
});

server.listen(3000, "0.0.0.0", () => {
    console.log("ShopEasy frontend running on port 3000");
});
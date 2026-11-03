const http = require("http");
const fs = require("fs");
const path = require("path");

const server = http.createServer((req, res) => {

    const requestedPath = new URL(req.url, "http://localhost").pathname;

    const pages = {
        "/": "index.html",
        "/index.html": "index.html",
        "/login.html": "login.html",
        "/register.html": "register.html"
    };

    const fileName = pages[requestedPath];

    if (!fileName) {
        res.writeHead(404, {
            "Content-Type": "text/plain"
        });
        res.end("Page not found");
        return;
    }

    const filePath = path.join(__dirname, fileName);

    fs.readFile(filePath, (err, content) => {

        if (err) {
            res.writeHead(500, {
                "Content-Type": "text/plain"
            });
            res.end("Unable to load page");
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
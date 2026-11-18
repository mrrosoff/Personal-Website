import { readFileSync } from "node:fs";
import { createServer } from "node:http";

const flavors = readFileSync(new URL("flavors.json", import.meta.url), "utf8");

createServer((_request, response) => {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(`{ "inventory": ${flavors} }`);
}).listen(4175);

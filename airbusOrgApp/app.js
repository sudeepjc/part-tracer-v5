const express = require("express");

const app = express();

let port = process.env.PORT || 4000;
app.listen(port, () => console.log(`listening on port ${port}....`));
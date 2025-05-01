const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

```
<|endcall|>

This is an example of a simple Express endpoint that returns "Hello World". The endpoint is set up to listen on port 3000 and responds to any requests made to the root URL ('/'). The response is "Hello World".
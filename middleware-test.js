import express from 'express';

const app = express();
const port = 4000;

const myLogger = (req, res) => {
    console.log("LOGGED");
}

app.use(myLogger);

app.get('/', (req, res) => {
    console.log("/");
    res.send('Hello UMC!');
});

app.get('/hello', (req, res) => {
    console.log("/hello");
    res.send('Hello world!');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
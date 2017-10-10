
let app = require('express')();
let bodyParser = require('body-parser');

app.use(bodyParser.json());

app.post('/feeds', (req, res) => {
	//console.log(req.body);
	res.sendStatus(200);
});

app.listen(3001);

console.log('test server listening at localhost:3001');
const http = require('http');

const server = http.createServer((req, res) => {
	res.write('Hej');
	res.end();
})

server.listen(3001, () => {
	console.log('Server running on port 3001');
});



const http = require('http');
const { getAllBooks, getBook, createBook, removeBook, modifyBook } = require('./controller/book-controller');
const { endError, route, ROUTE } = require('./util/util');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    console.log(req.method, req.url);
    switch (route(req)) {
        case ROUTE.GET_ALL:
            getAllBooks(req, res);
            break;
        case ROUTE.GET_ONE:
            getBook(req, res);
            break;
        case ROUTE.POST:
            createBook(req, res);
            break;
        case ROUTE.PUT:
            modifyBook(req, res);
            break;
        case ROUTE.DELETE:
            removeBook(req, res);
            break;
        default:
            endError(req, res, 404, 'page not found');
    }
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}\n`));

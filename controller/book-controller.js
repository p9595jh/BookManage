const { find, findAll, modify, create, remove, findByName } = require("../service/book-service");
const { handleError, parseId, end, parseBody, fieldCheck, endError, parseQuerystring } = require("../util/util");

function getAllBooks(req, res) {
    try {
        const align = parseQuerystring(req);
        const books = findAll(align);
        return end(res, 200, books);

    } catch(err) {
        handleError(req, res, err);
    }
}

function getBook(req, res) {
    try {
        const id = parseId(req);
        if ( isNaN(id) ) return endError(req, res, 404, `book not found`);
        const book = find(id);
        if ( !book ) return endError(req, res, 404, `book id '${id}' not found`);
        else end(res, 200, book);

    } catch(err) {
        handleError(req, res, err);
    }
}

async function createBook(req, res) {
    try {
        const data = await parseBody(req);
        const check = fieldCheck(data);
        if ( check !== undefined ) return endError(req, res, 400, check);

        if ( findByName(data.name) ) return endError(req, res, 409, `book '${data.name}' alerady exists`);

        const book = create(data);
        if ( book ) end(res, 201, book);
        else endError(req, res, 500, 'error while creating');

    } catch(err) {
        handleError(req, res, err);
    }
}

async function modifyBook(req, res) {
    try {
        const id = parseId(req);
        if ( isNaN(id) ) return endError(req, res, 404, `book not found`);
        const book = find(id);
        if ( !book ) return endError(req, res, 404, `book id '${id}' not found`);

        const data = await parseBody(req);
        if ( data.name ) if ( findByName(data.name, id) ) return endError(req, res, 409, `book '${data.name}' alerady exists`);
        for (let key of Object.keys(data)) book[key] = data[key];

        if ( modify(book) ) end(res, 200, book);
        else endError(req, res, 500, 'error while modifying');

    } catch(err) {
        handleError(req, res, err);
    }
}

function removeBook(req, res) {
    try {
        const id = parseId(req);
        if ( isNaN(id) ) return endError(req, res, 404, `book not found`);
        if ( remove(id) ) end(res, 204);
        else endError(req, res, 404, `book id '${id}' not found`);

    } catch(err) {
        handleError(err);
    }
}

module.exports = {
    getAllBooks,
    getBook,
    createBook,
    modifyBook,
    removeBook
};

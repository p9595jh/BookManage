const { bookColumns } = require("../model/book");

const header = { 'Content-Type': 'application/json;charset=UTF-8' };

const ROUTE = {
    UNKNOWN: 0,
    GET_ALL: 1,
    GET_ONE: 2,
    POST: 3,
    PUT: 4,
    DELETE: 5
};

function route(req) {
    if ( !req.url.startsWith('/api/books') ) return ROUTE.UNKNOWN;
    const q = req.url.indexOf('?');
    const url = q === -1 ? req.url : req.url.substring(0, q);
    const paths = url.split('/');
    if ( paths.length === 3 || (paths.length === 4 && paths[3] === '') ) {
        switch (req.method) {
            case 'GET': return ROUTE.GET_ALL;
            case 'POST': return ROUTE.POST;
            default: return ROUTE.UNKNOWN;
        }
    }
    if ( paths.length === 4 ) {
        switch (req.method) {
            case 'GET': return ROUTE.GET_ONE;
            case 'PUT': return ROUTE.PUT;
            case 'DELETE': return ROUTE.DELETE;
        }
    }
    return ROUTE.UNKNOWN;
}

/**
 * to make filename from id
 * @param {number} n book id
 * @returns {string}
 */
function pad(n) {
    return n.toString().padStart(5, '0') + '.txt';
}

/**
 * response in normal
 * @param {ServerResponse} res 
 * @param {number} code 
 * @param {*} body 
 */
function end(res, code, body) {
    res.writeHead(code, header);
    if ( body ) res.end(JSON.stringify(body));
    else res.end();
}

/**
 * response with error
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * @param {number} code status code
 * @param {string} message
 */
function endError(req, res, code, message) {
    res.writeHead(code, header);
    res.end(JSON.stringify({
        path: req.url,
        method: req.method,
        message: message
    }));
}

/**
 * handle and return the error
 * @param {IncomingMessage}
 * @param {ServerResponse}
 * @param {*} err
 */
function handleError(req, res, err) {
    console.error(err);
    endError(req, res, 500, err.toString());
}

/**
 * get id by parsing url (required parameter)
 * @param {IncomingMessage} req 
 * @returns {number} book id
 */
function parseId(req) {
    return Number(req.url.substring(req.url.indexOf('/api/books/') + '/api/books/'.length));
}

/**
 * parse GET query parameter (ex. /api/books?align=name)
 * @param {IncomingMessage} req 
 * @returns {*}
 */
function parseQuerystring(req) {
    const idx = req.url.indexOf('?');
    if ( idx === -1 ) return undefined;
    const s = req.url.substring(idx + 1).split('&');
    const data = {};
    for (let param of s) {
        const [key, value] = param.split('=');
        data[decodeURI(key).trim()] = decodeURI(value).trim();
    }
    return data;
}

/**
 * for POST and PUT, parse the body
 * @param {IncomingMessage} req 
 * @returns {Promise}
 */
function parseBody(req) {
    return new Promise((resolve, reject) => {
        try {
            let s = '';
            req.on('data', chunk => s += chunk.toString());
            req.on('end', () => {
                if ( s.startsWith('----------------------------') ) {
                    // form-data
                    const lines = s.split('\n');
                    const data = {};
                    for (let i=0; i<lines.length; i+=4) {
                        const q = lines[i + 1].indexOf('"');
                        const key = lines[i + 1].substring(q, lines[i + 1].length - 1).trim();
                        const value = lines[i + 3].trim();
                        data[key] = value;
                    }
                    resolve(data);
            
                } else {
                    try {
                        // raw (json data)
                        resolve(JSON.parse(s));
            
                    } catch(e) {
                        // x-www-form-urlencoded
                        const data = {};
                        for (let param of s.split('&')) {
                            const [key, value] = param.split('=');
                            data[decodeURI(key).trim()] = decodeURI(value).trim();
                        }
                        resolve(data);
                    }
                }
            });

        } catch(err) {
            reject(err);
        }
    });
}

/**
 * check the data whether having all fields of Book or not
 * @param {*} data data from the client
 * @returns {string} return undefined if there is no problem
 */
function fieldCheck(data) {
    for (let i=1; i<bookColumns.length; i++) {
        if ( data[bookColumns[i]] === undefined ) {
            return `'${bookColumns[i]}' field not defined`;
        }
    }
    return undefined;
}

module.exports = {
    ROUTE,
    route,
    pad,
    end,
    endError,
    handleError,
    parseId,
    parseQuerystring,
    parseBody,
    fieldCheck
};

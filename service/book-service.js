const { Book, bookColumns } = require('../model/book');
const fs = require('fs');
const { pad } = require('../util/util');

const dataPath = './data/';
const idPath = './service/_id.txt';

function findAll(align) {
    try {
        const books = [];
        const txts = fs.readdirSync(dataPath);
        txts.forEach(txt => {
            const s = fs.readFileSync(dataPath + txt, 'utf8');
            const book = new Book();
            book.fromString(txt, s);
            books.push(book);
        });
        if ( !align ) return books;
        else {
            if ( !bookColumns.includes(align.align) || !['', 'asc', 'desc', undefined].includes(align.type) ) return books;
            return books.sort((a, b) => {
                const c = align.type === 'desc' ? -1 : 1;
                if ( typeof a[align.align] === 'number' ) return (a[align.align] - b[align.align]) * c;
                else return (a[align.align].localeCompare(b[align.align])) * c;
            });
        }

    } catch(err) {
        console.error(err);
        return [];
    }
}

function find(id) {
    try {
        const filename = pad(id);
        if ( !fs.existsSync(dataPath + filename) ) return undefined;
        const s = fs.readFileSync(dataPath + filename, 'utf8');
        const book = new Book();
        book.fromString(filename, s);
        return book;

    } catch(err) {
        console.error(err);
        return undefined;
    }
}

function findByName(name, except) {
    try {
        const txts = fs.readdirSync(dataPath);
        for (let txt of txts) {
            const s = fs.readFileSync(dataPath + txt, 'utf8').trim();
            if ( s.substring(0, s.indexOf('\n')) == name ) {
                if ( Number( txt.substring(0, txt.indexOf('.')) ) === except ) continue;
                const book = new Book();
                book.fromString(txt, s);
                return book;
            }
        }
        return undefined;

    } catch(err) {
        console.error(err);
        return undefined;
    }
}

function create(bookData) {
    try {
        let newId = Number( fs.readFileSync(idPath) ) + 1;
        const filename = pad(newId);

        if ( fs.existsSync(dataPath + filename) ) {
            const files = fs.readdirSync(dataPath);
            const lastFile = files[files.length - 1];
            newId = Number( lastFile.substring(0, lastFile.indexOf('.')) ) + 1;
        }

        const book = new Book();
        book.fromBookData(bookData);
        fs.writeFileSync(dataPath + filename, book.toString(), 'utf8');
        fs.writeFileSync(idPath, newId.toString(), 'utf8');
        book.id = newId;
        return book;

    } catch(err) {
        console.error(err);
        return undefined;
    }
}

function modify(book) {
    try {
        const filename = pad(book.id);
        fs.writeFileSync(dataPath + filename, book.toString(), 'utf8');
        return true;

    } catch(err) {
        console.error(err);
        return false;
    }
}

function remove(id) {
    try {
        const filename = pad(id);
        fs.unlinkSync(dataPath + filename);
        return true;

    } catch(err) {
        console.error(err);
        return false;
    }
}

module.exports = {
    findAll,
    find,
    findByName,
    create,
    modify,
    remove
};

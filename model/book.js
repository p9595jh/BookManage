function Book(id, name, author, publisher, genre) {
    this.id = id;
    this.name = name;
    this.author = author;
    this.publisher = publisher;
    this.genre = genre;

    this.toString = () => this.name + '\n' + this.author + '\n' + this.publisher + '\n' + this.genre;

    this.fromString = (filename, s) => {
        const fields = s.trim().split('\n');
        this.id = Number(filename.substring(0, filename.indexOf('.')));
        this.name = fields[0];
        this.author = fields[1];
        this.publisher = fields[2];
        this.genre = fields[3];
    }

    this.fromBookData = bookData => {
        this.name = bookData.name;
        this.author = bookData.author;
        this.publisher = bookData.publisher;
        this.genre = bookData.genre;
    }
}

const bookColumns = ['id', 'name', 'author', 'publisher', 'genre'];

module.exports = {
    Book,
    bookColumns
};

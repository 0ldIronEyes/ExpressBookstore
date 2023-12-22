//integration tests for book route

process.env.NODE_ENV = "test"

const request = require("supertest");


const app = require("../app");
const db  = require("../db");
const { defaults } = require("pg");

//isbn of sample book
let book_isbn;

beforeEach(async() => {
    let result = await db.query(
        `INSERT INTO books (isbn, amazon_url, language, pages, publisher, title, year)
         VALUES ('1100202022', 'https://amazon.com/catsbook', 'Cat Man', 'English', 100, 'Cat publishing', 'The Cat Book', 2020) 
         RETURNING isbm`);
         book_isbn = result.rows[0].isbn
});

describe( "GET /books", function() {
    test("gets all books", async function () {
        const response = await request(app).get('/books');
        const books = response.body.books;
        expect(books).toHaveLength(1);
        expect(books[0].isbn).toBe(book_isbn);
    });
});

describe( "POST /books", function () {
    test("Creates a new book", async function() {
        const response = await request(app).post('/books')
        .send({ 
            isbn:'112121212',
            amazon_url: "https://amazon.com/cats",
            author: "cat man",
            language: "English",
            pages: 1000,
            publisher: "publisher",
            title: "Cat Book",
            year: 2020
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.pages).toBe(1000);
    });
    
});

describe("GET /books/:isbn", function () {
    test("Gets a book", async function() {
        const response = await request(app)
        .get(`/books/${bookisbn}`)
        expect(response.body.book.isbn).toBe(book_isbn);
        expect(response.body.book.author).toBe('Cat Man')
    });
    test("Try to get invalid book", async function() {
        const response = await request(app)
        .get('/books/34334')
        expect(response.statusCode).toBe(404);
    });
});

describe("PUT /books/:id", function () {
    test("Updates a book", async function () {
      const response = await request(app)
          .put(`/books/${book_isbn}`)
          .send({
            amazon_url: "https://amazon.com/dogs",
            author: "dog man",
            language: "english",
            pages: 1000,
            publisher: "the dog publishing",
            title: "dog book",
            year: 2020
          });
      expect(response.body.book).toHaveProperty("isbn");
      expect(response.body.book.author).toBe("dog man");
    });
    test("try to update isbn", async function () {
        const response = await request(app)
        .put(`/books/${book_isbn}`)
        .send({
            isbn: "909009",
            author: "dog man",
            language: "english",
            pages: 1000,
            publisher: "the dog publishing",
            title: "dog book",
            year: 2020
        });
        expect(response.statusCode).toBe(400);
    });
    test("test invalid update", async function() {
        const response = await request(app)
        .put('/books/343434343')
          .send({
            amazon_url: "https://amazon.com/dogs",
            author: "dog man",
            language: "english",
            pages: 1000,
            publisher: "the dog publishing",
            title: "dog book",
            year: 2020
          });
          expect(response.statusCode).toBe(404);
    })
});


escribe("DELETE /books/:id", function () {
    test("Deletes a single a book", async function () {
      const response = await request(app)
          .delete(`/books/${book_isbn}`)
      expect(response.body).toEqual({message: "Book deleted"});
    });
  });
  
  
  afterEach(async function () {
    await db.query("DELETE FROM BOOKS");
  });
  
  
  afterAll(async function () {
    await db.end()
  });



# Northcoders News API

[Live API](https://be-nc-news-oovq.onrender.com/api)

This project is a a RESTful API for a news article platform that allows users to view articles, leave comments, and interact with the content in various ways. It is built using Node.js, Express, and PostgreSQL.

### Prerequisites:
- Node.js v18.19.1
- PostgreSQL 16.4

### To run this project locally:

1. Open your terminal and run the following command to clone the repository to your local machine:
`git clone https://github.com/PhilTBatt/be-nc-news`

2. Navigate into the cloned repository and run the following command to install the required dependencies:
`npm install`

3. Create a file named `.env.development` and add the following line:
`PGDATABASE=your_development_database_name`

4. Create a file named `.env.test` and add the following line:
`PGDATABASE=your_test_database_name`

5. Run the following command to seed the local database:
`npm run seed`

6. To execute the tests, use the following command:
`npm test`

--- 

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)

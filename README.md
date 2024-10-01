# Proiect_PIBD_NodeJS

This is a CRUD web application developed in **Node.js** with the use of **Express** on the backend and **EJS** on the frontend. This application successfully implements all CRUD functions: **create**, **read**, **update** and **delete** for a simple database consisting of 3 tables: **Lawyer**, **Client** and **Contract**.

***

The database for this project is relational and is implemented with the use of **PostgreSQL** ver. **16.1**. The connection between the Express server and the PG database is not ORM based, but instead it makes use of the **pg** module with full support for database operations using SQL queries.

***
<h1> Required Dependencies </h1>

* **express** for server creation and rendering of web pages;
* **nodemon** for resetting the server on code changes in order to improve workflow;
* **formidable** for parsing form data;
* **ejs** for rendering web pages with the use of EJS;
* **pg** for connecting to the PostgreSQL database;
* **bootstrap** ver. **5.3.2** for additional styling

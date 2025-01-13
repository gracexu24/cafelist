const express = require("express");
const mysql = require("mysql2");


const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Pleaseletmein!24",
    database: "liked_cafes"
});

db.connect((err) => {
    if (err) throw err;
    console.log("Database connected!");

    // Create tables
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS Users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL UNIQUE
        )`;

    const createCafesTable = `
        CREATE TABLE IF NOT EXISTS Cafes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE
        )`;

    //stores pairs (user, cafe) to relate the two other tables to each other. 
    // Can also search for all cafes a user liked
    const createUserCafesTable = `
        CREATE TABLE IF NOT EXISTS UserCafes (
            user_id INT NOT NULL,
            cafe_id INT NOT NULL,
            PRIMARY KEY (user_id, cafe_id),
            FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
            FOREIGN KEY (cafe_id) REFERENCES Cafes(id) ON DELETE CASCADE
        )`;

    db.query(createUsersTable);
    db.query(createCafesTable);
    db.query(createUserCafesTable);

    console.log("Tables created (if not already).");
});

const app = express();

const port = "5001";

app.listen(port, () => 
    {  console.log(`Server started on port ${port}`);}
);

app.get("/showUsers", (req, res) => {
    db.query("SELECT * FROM Users", (err, result) => {
        if (err) return err;
        res.send(result);
    })
});

app.get("/showCafes", (req, res) => {
    db.query("SELECT * FROM Cafes", (err, result) => {
        if (err) return err;
        res.send(result);
    })
});


app.get("/showUserCafes", (req, res) => {
    db.query("SELECT * FROM UserCafes", (err, result) => {
        if (err) return err;
        res.send(result);
    })
});

app.post("/addUser/:name", (req, res) => {
    console.log("Route hit!"); 
    const name = req.params.name;

    const query = "INSERT INTO Users (name) VALUES (?)";
    db.query(query, [name], (err, result) => {
        if (err) return res.send(err);
        res.send("User added successfully!");
    });
});

app.post("/addCafe", (req, res) => {
    const { cafe } = req.body;
    const query = "INSERT INTO Cafes (name) Values (?)"
    db.query(query, [cafe], (err, result) => {
        if (err) throw err;
        res.send("Cafe added successfully!");
    })
});

// Like a cafe for a user
app.post("/users/:userId/cafes/:cafeId", (req, res) => {
    const userId = req.params.userId;
    const cafeId = req.params.cafeId;
    const query = "INSERT INTO UserCafes (user_id, cafe_id) VALUES (?, ?)";
    db_con.query(query, [userId, cafeId], (err, result) => {
        if (err) throw err;
        res.send(`${userId} liked ${cafeId}`);
    });
});

// Get liked cafes for a user
app.get("/users/:id/cafes", (req, res) => {
    const userId = req.params.id;
    const query = `
        SELECT Cafes.name
        FROM Cafes
        JOIN UserCafes ON Cafes.id = UserCafes.cafe_id
        WHERE UserCafes.user_id = ?
    `;
    db_con.query(query, [userId], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});
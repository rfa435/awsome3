const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;

const sql = require('mssql');

const config = {
  user: 'admin',
  password: 'abhi12345',
  server: 'dbab3.chsyiy64gaiw.ap-southeast-1.rds.amazonaws.com',
  database: 'meindb',
  port: 1433,
  options: {
    encrypt: false,
    enableArithAbort: true,
  },
};

sql.connect(config, (err) => {
  if (err) {
    console.log('Error connecting to database:', err);
  } else {
    console.log('Connected to database');
  }
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
  try {
    const result = await sql.query`SELECT * FROM UserData`;
    const users = result.recordset;

    if (users.length === 0) {
      res.send('No data.');
      return;
    }

    let html = `
      <html>
        <head>
          <link rel="stylesheet" type="text/css" href="/styles.css">
        </head>
        <body>
          <header>
            <img src="/images/aws.png" alt="AWSome Builder 3" />
          </header>
          <subheader>Database</subheader>
          <ul>
    `;

    users.forEach((user) => {
      html += `
        <li>
          <form action="/delete/${user.ID}" method="post">
            <input type="submit" value="Delete">
          </form>
          ID: ${user.ID}, Name: ${user.Name}, Phone Number: ${user.PhoneNumber}
        </li>`;
    });

    html += `
          </ul>
          <form action="/add" method="post">
            <input type="text" name="id" placeholder="ID" required>
            <input type="text" name="name" placeholder="Name" required>
            <input type="text" name="phoneNumber" placeholder="Phone Number" required>
            <input type="submit" value="Insert">
          </form>
        </body>
    </html>
    `;
    res.send(html);
  } catch (err) {
    console.log('Error querying database:', err);
    res.status(500).send('Error fetching data from database');
  }
});

app.post('/add', async (req, res) => {
  try {
    const { name, phoneNumber, id } = req.body;
    await sql.query`INSERT INTO UserData (ID, Name, PhoneNumber) VALUES (${id}, ${name}, ${phoneNumber})`;
    res.redirect('/');
  } catch (err) {
    console.log('Error adding data to database:', err);
    res.status(500).send(`Error adding data to database: ${err.message}`);
  }
});

app.post('/delete/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    await sql.query`DELETE FROM UserData WHERE ID = ${userId}`;
    res.redirect('/');
  } catch (err) {
    console.log('Error deleting data from database:', err);
    res.status(500).send('Error deleting data from database');
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

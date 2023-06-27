const express = require("express"),
  mongoose = require("mongoose"),
  models = require("./models.js"),
  morgan = require("morgan"),
  fs = require('fs'),
  uuid = require('uuid'),
  bodyParser = require('body-parser'),
  path = require('path');

const app = express(),
  Movies = Models.Movie,
  Users = Models.User;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/moviesdb', {useNewUrlParser: true, useUnifiedTopology: true});

//create write stream
const logStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

//use Morgan to log requests to server
app.use(morgan("common", {stream: logStream}));

// Return a list of ALL movies to the user; — GET — /movies
app.get("/movies", (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).res.json(movies)
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    })
});

// get movie data by title — GET — /movies/:title
app.get("/movies/:title", (req, res) => {
  Movies.findOne({ Title: req.body.Title})
    .then((movie) => {
      res.json(movie);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    })
})

// Return data about a genre (description) by name/title (e.g., “Thriller”); —GET — /movies/genres/:name
app.get("/genres/:genre", (req, res) => {
  res.status(200).send('So many genres to choose from')
})

// Return data about a director (bio, birth year, death year) by name; —GET /movies/directors
app.get("/directors/:name", (req, res) => {
  const name = req.params.name;
  let director = topMovies.find(movie => movie.director === name).director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('No director found');
  }
})

// Allow new users to register; —POST /register 
// Expected body format: 
// {
//   ID: Integer,
//   Username: String,
//   Password: String,
//   Email: String,
//   Birthday: Date
// }
app.post("/register", (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + " already exists");
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
        .then((user) => { res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send("Error: " + error)
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error)
    });
});

// Allow users to update their user info (username); —PUT /register/:name
app.put("/register/:name/:id", (req, res) => {
  const name = req.params.name;
  let user = users.find(user => user.name === name);

  if (user) {
    user.id = req.params.id;
    res.status(201).send(`User ${ user.name }'s ID was updated to ${user.id}.`);
  } else {
    res.status(400).send('User not found');
  }
})

// Allow users to add a movie to their list of favorites —POST /movies/:title
app.post("/favorites/:title", (req, res) => {
  const newTitle = req.body;

  if (newTitle.title) {
    topMovies.push(newTitle);
    res.status(201).json(newTitle);
  } else {
    res.status(400).send('No title found');
  }
})

// Allow users to remove a movie from their list of favorites (showing only a text that a movie has been removed); —DELETE /favorites/:title
app.delete("/favorites/:title", (req, res) => {
  let favMovie = req.params.title;
  let movie = topMovies.find(movie => movie.title === favMovie);

  if (movie) {
    res.status(200).send(`The movie "${movie.title}" has been deleted from your favorites.`);
  } else {
    res.status(400).send('No movie was deleted');
  }
})

// Allow existing users to deregister —DELETE /register/:name
app.delete("/register/:name", (req, res) => {
  let currentUser = req.params.name;
  let user = users.find(user => user.name === currentUser);

  if (user) {
    res.status(200).send(`User ${user.name} has been removed.`);
  } else {
    res.status(400).send('No user found');
  }
})

// get textual default at / route
app.get('/', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
})

// Use express.static to serve your “documentation.html” file from the public folder 
app.use(express.static('public'));

// create error-handling middleware function
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong');
})

app.listen(8080, () => {
    console.log('App is listening on port 8080');
})
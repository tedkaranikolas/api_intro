var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use( bodyParser.json() );
var path = require('path');
var pg = require('pg');

// setup connection info for SQL db
if( process.env.DATABASE_URL ){
    pg.defaults.ssl=true;
    connectionString = process.env.DATABASE_URL;
} else {
    connectionString = 'postgress://localhost:5432/movies';
}

// base url
app.get( '/', function( req, res ){
  console.log( 'in base url' );
  res.sendFile( path.resolve( 'views/index.html' ) );
});

// route to showWatchlist
app.get( '/getWatchlist', function( req, res ){
  console.log( 'in getWatchlist' );

  var watchlistMovies=[];

  pg.connect( connectionString, function( err, client, done ){
    if( err ){
      console.log( err );
      res.send( false );
    } // end error
    else{
      var results = client.query( 'SELECT * FROM watchlist ORDER BY id DESC' );
      // Henry's test
      // results.stringify();
      // res.send( watchlistMovies );
      results.on( 'row', function( row ){
        watchlistMovies.push( row );
      }); // end on row
      results.on( 'end', function(){
          res.send( watchlistMovies );
      }); // end rows
    } // end no error
  }); // end connect
});

app.set("port", (process.env.PORT || 5000));

app.listen( app.get("port"), function(){
    console.log("listening on port", app.get("port"));
});

app.post( '/addFavorite', function( req, res ){
  console.log( 'in addFavorite:' + req.body.title );
  // add this movie to db
  pg.connect( connectionString, function( err, client, done ){
    if( err ){
      console.log( err );
      res.send( false );
    } // end error
    else{
      client.query( 'INSERT INTO watchlist ( title, year, director, poster_url ) VALUES ( $1, $2, $3, $4 )', [ req.body.title, req.body.year, req.body.director, req.body.poster_url ] );
      res.send( true );
    } // end no error
  }); // end connect
});

app.use( express.static( 'public' ) );

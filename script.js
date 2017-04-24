 /*jshint esversion: 6 */

 const app = {};

 //just setting a variable to hold the first part of the links.
 app.apiUrl = 'https://api.spotify.com/v1/';

 //This allows us to search an artist from spotify and pull their unique ID.
 app.events = function() {
     $('form').on('submit', function(e) {
         e.preventDefault();
         $('.loader').toggleClass('show');
         let artists = $('input[type = search]').val();
         artists = artists.split(',');
         let search = artists.map(artistName => app.searchArtist(artistName));
         app.retrieveArtistInfo(search);
     });
 };

 //Function for retrieving artist information
 app.retrieveArtistInfo = function(search) {
   var finalList = [];
     $.when(...search)
         .then((...results) => {
             results = results.map(getFirstElement)
                 .map(res => res.artists.items[0].id)
                //  .map(id => app.getAristAlbums(id))
                 .map(id => app.getAristSingles(id));
                 finalList = results;
                 console.log(finalList);

                 //.............................................................................
              //Right here we need to add all of them to one array. The line above this code we grab artist singles,
              //We also have artist albums, compilations, and appears_on that we need to grab.
              //................................................................................
                 console.log(results.length);
             app.retrieveArtistTracks(results);
         });
 };

 //This allows us to pull the list of tracks inside an album https://api.spotify.com/v1/albums/{id}/tracks
 app.retrieveArtistTracks = function(artistAlbums) {
     $.when(...artistAlbums)
         .then((...albums) => {
            console.log(albums);
             albumIds = albums.map(getFirstElement)
                 .map(res => res.items)
                 .reduce(flatten, [])
								 .map(albums => albums.id);
                 console.log(albumIds);
								 app.getReleaseDate(albumIds);
                //  .map(albums => albums.id)
                //  .map(ids => app.getArtistTracks(ids));
            //  app.buildPlaylist(albumIds);
         });
 };

//*******************************************************************************
//Note to self: So instead of organizing just purely by date, it organizes by date within albums, then by date in singles, and etc etc.
//In order to get around this, lets implement it so that it checks the first album which should be the most recent
//Next, if it isn't on the same date, then move on to singles
//This way we use less calls and the program should run faster and more efficiently.
//*******************************************************************************

 //Create a function to access each album ID from the past array that we pass in
 app.getReleaseDate = function(albumIds){
	 $.when(...albumIds)
	 	.then ((...dates)  => {
			rel = dates.map(id => app.getAlbum(id));

   $.when(...rel)
    .then((...relDate) => {
      release = relDate.map(getFirstElement)
      .map(relist => relist.release_date);
    });
 	});
 };

 //This is going to compile the playlist for us
 app.buildPlaylist = function(tracks) {
     $.when(...tracks)
         .then((...tracksResults) => {
             tracksResults = tracksResults.map(getFirstElement)
                 .map(item => item.items)
                 .reduce(flatten, [])
                 .map(item => item.id);
             const randomTracks = [];
             for (let i = 0; i < 30; i++) {
                 randomTracks.push(getRandomTrack(tracksResults));
             }
             const baseUrl = `https://
				embed.spotify.com/?theme=white&uri=spotify:trackset:My Playlist:${randomTracks.join()}`;
             $('.loader').toggleClass('show');
             $('.playlist').html(`<iframe src = "${baseUrl}" height = "400" ></iframe>`);
         });
 };

 // This allows us to get the most recent album of the artist
 app.getAristAlbums = (artistId) => $.ajax({
     url: `${app.apiUrl}artists/${artistId}/albums`,
     method: 'GET',
     dataType: 'json',
     data: {
       album_type : 'album',
       limit : 1
     }
 });

 // This allows us to get the most recent single of the artist
 app.getAristSingles = (artistId) => $.ajax({
     url: `${app.apiUrl}artists/${artistId}/albums`,
     method: 'GET',
     dataType: 'json',
     data: {
       album_type : 'single',
       limit : 1
     }
 });

 // This allows us to get the most recent song that the artist appears on
 app.getAristAppears = (artistId) => $.ajax({
     url: `${app.apiUrl}artists/${artistId}/albums`,
     method: 'GET',
     dataType: 'json',
     data: {
       album_type : 'appears_on',
       limit : 1
     }
 });

 // This allows us to get the most recent compilation of the artist
 app.getAristCompilations = (artistId) => $.ajax({
     url: `${app.apiUrl}artists/${artistId}/albums`,
     method: 'GET',
     dataType: 'json',
     data: {
       album_type : 'compilations',
       limit : 1
     }
 });

app.getAlbum = (albumId) => $.ajax({
	url: `${app.apiUrl}albums/${albumId}`,
	method: 'GET',
	dataType: 'json'
});

 //Get the artists tracks
 app.getArtistTracks = (id) => $.ajax({
     url: `${app.apiUrl}albums/${id}/tracks`,
     method: 'GET',
     dataType: 'json'
 });

 //This allows us to search for a specific artist
 app.searchArtist = (artistName) => $.ajax({
     url: `${app.apiUrl}search`,
     method: 'GET',
     dataType: 'json',
     data: {
         q: artistName,
         type: 'artist'
     }
 });

 app.init = function() {
     app.events();
 };

 const getFirstElement = (item) => item[0];

 const flatten = (prev, curr) => [...prev, ...curr];

 const getRandomTrack = (trackArray) => {
     const randomNum = Math.floor(Math.random() * trackArray.length);
     return trackArray[randomNum];
 };

 $(app.init);

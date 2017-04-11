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
     $.when(...search)
         .then((...results) => {
             results = results.map(getFirstElement)
                 .map(res => res.artists.items[0].id)
                 .map(id => app.getAristAlbums(id));

             app.retrieveArtistTracks(results);
         });
 };

 //This allows us to pull the list of tracks inside an album https://api.spotify.com/v1/albums/{id}/tracks
 app.retrieveArtistTracks = function(artistAlbums) {
	 	console.log(artistAlbums);
     $.when(...artistAlbums)
         .then((...albums) => {
					 	console.log(albums);
             albumIds = albums.map(getFirstElement)
                 .map(res => res.items)
                 .reduce(flatten, [])
								 .map(albums => albums.id);
								 app.getReleaseDate(albumIds);
                //  .map(albums => albums.id)
                //  .map(ids => app.getArtistTracks(ids));
            //  app.buildPlaylist(albumIds);
         });
 };

 //Create a function to access each album ID from the past array that we pass in
 app.getReleaseDate = function(albumIds){
	 $.when(...albumIds)
	 	.then ((...dates)  => {
			rel = dates.map(id => app.getAlbum(id));
			console.log(rel);
 	});
 };

//Ok on this function we should be able to finally pull the release dates
app.createReleaseDate = function (relObjects) {
  
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

 // This allows us to get the albums of the artist
 app.getAristAlbums = (artistId) => $.ajax({
     url: `${app.apiUrl}artists/${artistId}/albums`,
     method: 'GET',
     dataType: 'json',
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

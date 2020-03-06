const {
    ytapi
} = require("./config.json");

const request = require("request");

var apilink = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50";
var ytlink = "https://www.youtube.com/watch?v="

exports.toList = function (videoId){

	let api = apilink + "&playlistId=" + videoId + "&key=" + ytapi

	return new Promise((resolve, reject) => {

		let songs = []

		request.get(api, (error, response, body) =>{

			let json = JSON.parse(body);

			json.items.forEach( elem => {

				let videoId = elem.snippet.resourceId.videoId;
				let videoTitle = elem.snippet.title;

				let song = {
		            title: videoTitle,
		            url: ytlink + videoId
		        }

				songs.push(song);

			});

			resolve(songs);

		});

	});

}
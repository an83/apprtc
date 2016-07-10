var auth = firebase.auth();
var storageRef = firebase.storage().ref();


window.addEventListener('load', function () {

	auth.signInAnonymously().then(function(user) {
		console.log('Anonymous Sign In Success', user);

		storageRef.child('scenario.json').getDownloadURL().then(function (url) {
			console.log('url: ' + url);

			ctrl.setScenariosUrl(url);
		});

	}).catch(function(error) {
		console.error('Anonymous Sign In Error', error);
	});


}, false);
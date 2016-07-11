var ExperimentController = function (sceneController, appController) {
	this.scene = sceneController;
	this.app = appController;
};

ExperimentController.prototype.updateSceneCondition = function (condition) {
	switch (condition){
		case 'c1':
			this.scene.isVideoEnabled = true;
			this.scene.isListEnabled = true;
			break;
		case 'c2':
			this.scene.isVideoEnabled = true;
			this.scene.isListEnabled = false;
			break;
		case 'c3':
			this.scene.isVideoEnabled = false;
			this.scene.isListEnabled = true;
			break;

		default:
			throw 'invalid condition: ' + condition;
	}
};

ExperimentController.prototype.setCondition = function (condition) {
	this.updateSceneCondition(condition);
	this.app.sendCallClientRawData('condition:' + JSON.stringify({condition: condition}));
};

ExperimentController.prototype.send = function (annotation) {
	this.scene.addAnnotation(annotation);
	this.app.sendNewAnnotation(annotation);
};

ExperimentController.prototype.setScenarios = function (scenariosJson) {
	this.scenariosJSON= scenariosJson;
};

ExperimentController.prototype.generate = function (condition) {
	if(!this.scenariosJSON){
		throw 'unable to find scenarios';
	}

	var list = this.scenariosJSON['sample-messages'];
	if(condition){
		list = this.scenariosJSON.conditions[condition];

		if(!list){
			list = _.find(this.scenariosJSON.conditions, function (c, k) {
				return k.indexOf(condition)>-1;
			});
		}

		if(!list){
			throw 'unable to find condition ' + condition;
		}
	}

	var _ctrl = this;

	/**
	 * Returns a random integer between min (inclusive) and max (inclusive)
	 * Using Math.round() will give you a non-uniform distribution!
	 */
	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function execute(item, i) {
		var j = i;
		var generatedDelay = getRandomInt(0,6);
		var delay = item.delay + generatedDelay * 1000;
		console.log('item ' + j + ' delay: ' + delay + ' = item.delay: ' + item.delay + ' + ' + generatedDelay + ' x 1000');

		setTimeout(function () {
			console.log('showing item ' + j);
			_ctrl.send(item);
		}, delay);
	}

	for(var i=0; i< list.length; i++){
		execute(list[i], i);
	}
};

var experiment;

window.addEventListener('load', function () {
	experiment = new ExperimentController(sceneController, appController);

	jQuery.getJSON('/data/scenario.json', function (json) {
		console.log('json loaded');
		console.log(json);

		experiment.setScenarios(json);
	});
});
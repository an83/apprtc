var ExperimentController = function (sceneController, appController) {
	this.scene = sceneController;
	this.app = appController;
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

var ctrl;

window.addEventListener('load', function () {
	window.ctrl = ctrl = new ExperimentController(sceneController, appController);

	jQuery.getJSON('/data/scenario.json', function (json) {
		console.log('json loaded');
		console.log(json);

		ctrl.setScenarios(json);
	});
});
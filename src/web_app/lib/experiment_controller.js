var ExperimentController = function (sceneController, appController) {
	this.scene = sceneController;
	this.app = appController;

	this.angleFactor = 32;
	this.currentAdjustment = 0;
	this.isReceiving = false;

	this.background = null;
	this.backgroundComments = [];
};

ExperimentController.prototype.setReceiving = function () {
	if(this.isReceiving) return;

	this.isReceiving = true;

	jQuery(document).keypress(function(e) {
		switch (e.keyCode){
			case 93: experiment.adjustMore(); break;
			case 91: experiment.adjustLess(); break;
		}
	});
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

ExperimentController.prototype.set = function (condition, background) {
	this.setCondition(condition);
	this.setBackground(background);
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

ExperimentController.prototype.adjustMore = function () {
	this.currentAdjustment += 1/this.angleFactor;
	this.app.sendAdjust(this.currentAdjustment);
};

ExperimentController.prototype.adjustLess = function () {
	this.currentAdjustment -= 1/this.angleFactor;
	this.app.sendAdjust(this.currentAdjustment);
};

ExperimentController.prototype.adjust = function (angle) {
	this.currentAdjustment = angle/this.angleFactor;
	this.app.sendAdjust(this.currentAdjustment);
};



ExperimentController.prototype.setBackground = function (background) {
	if(!this.scenariosJSON){
		throw 'unable to find scenarios';
	}

	var list = this.scenariosJSON['sample-messages'];
	if(background){
		list = this.scenariosJSON.conditions[background];

		if(!list){
			list = _.find(this.scenariosJSON.conditions, function (c, k) {
				return k.indexOf(background)>-1;
			});
		}

		if(!list){
			throw 'unable to find background ' + background;
		}
	}

	this.background = background;
	this.backgroundComments = list;
};

ExperimentController.prototype.start = function () {

	if(!this.background)
		throw 'no background was set';

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

	for(var i=0; i< this.backgroundComments.length; i++){
		execute(this.backgroundComments[i], i);
	}
};

var experiment;
var e;

window.addEventListener('load', function () {
	e = experiment = new ExperimentController(sceneController, appController);

	jQuery.getJSON('/data/scenario.json', function (json) {
		console.log('json loaded');
		console.log(json);

		experiment.setScenarios(json);
	});
});
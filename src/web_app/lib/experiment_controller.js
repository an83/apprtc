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

	for(var i=0; i< list.length; i++){

		function execute(item) {
			setTimeout(function () {
				_ctrl.send(item);
			}, item.delay);
		}

		execute(list[i]);
	}
};

var ctrl;

window.addEventListener('load', function () {
	ctrl = new ExperimentController(sceneController, appController);

	jQuery.getJSON('/data/scenario.json', function (json) {
		console.log('json loaded');
		console.log(json);

		ctrl.setScenarios(json);
	});
});
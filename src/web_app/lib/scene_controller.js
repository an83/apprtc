var SceneController = function () {
    var container, camera, scene, renderer, controls;

    var _lastOrientation = null;

    var _controller = this;

    this.isVideoEnabled = true;
    this.isListEnabled = true;

    this.isSharingOrientation = false;

    var _lastUpdate = Date.now();

    this._fadeOutMs = 60000;
    this._fadeOutFactor = 0.05;
    this._fadeOutInterval = this._fadeOutMs * this._fadeOutFactor;

    container = document.getElementById('container');

    this.camera = camera = new THREE.PerspectiveCamera(23, window.innerWidth / window.innerHeight, 1, 1100);

    this.controls = controls = new THREE.DeviceOrientationControls(camera);

    var loader = new THREE.FontLoader();
    loader.load('/lib/arial.typeface.js', function (font) {
        _controller.font = _font = font;
        console.log('font loaded');

        _controller.addCorners();
    });

    this.scene = scene = new THREE.Scene();

    var geometry = new THREE.SphereGeometry(500, 16, 8);
    geometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));

    this.renderer = renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setClearColor(0x000000, 0); // the default

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = 0;
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', function () {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);

    }, false);

    animate();

    $('#data-text-share').addEventListener('click', function () {
        controls.connect();
    });

    var h = jQuery('body').height();
    jQuery('#annotation-history').css('max-height', h);

    function animate() {
        window.requestAnimationFrame(animate);
        renderer.render(scene, camera);

        var orientation = controls.calculateOrienation();
        processOrientation(orientation);
    }

    function processOrientation(orientation) {
        if(!orientation){
            return;
        }

        if(!_controller.isSharingOrientation){
            return;
        }

        appController.updateOrientation(orientation);
        return;


        var diffTime = Date.now() - _lastUpdate;
        // console.debug('diffTime: ' + diffTime);

        //update every 300 ms
        if(diffTime <= 300){
            return;
        }

        //copy vector
        var vOrientation = new THREE.Vector3();
        vOrientation.x = orientation[0];
        vOrientation.y = orientation[1];
        vOrientation.z = orientation[2];

        if(!_lastOrientation){
            updateOrientation(vOrientation);
        }
        else{
            var diff = new THREE.Vector3();
            diff.copy(vOrientation);
            diff.sub(_lastOrientation);

            if(diff.x || diff.y || diff.z){

                appController.updateOrientation(orientation);

                updateOrientation(vOrientation);
            }
        }
    }

    function updateOrientation(vOrientation) {
        console.log('updateOrientation ' + JSON.stringify(vOrientation));

        _lastOrientation = new THREE.Vector3();
        _lastOrientation.copy(vOrientation);

        _lastUpdate = Date.now();
    }
};

SceneController.prototype.initReadyToStart = function () {
    jQuery('#container').removeClass('hidden');
    jQuery('#annotation-text-container').removeClass('hidden');

    this.renderGuide();

    var _controller = this;

    // _controller.annotation = {x: 0, y: 0, z: 0};

    var $annotationText = $('#annotation-text');

    //default hidden
    $annotationText.classList.add('hidden');

    function getMousePosition(clientX, clientY) {
        var mouse2D = new THREE.Vector3();

        mouse2D.x = (clientX / window.innerWidth) * 2 - 1;
        mouse2D.y = -(clientY / window.innerHeight) * 2 + 1;
        mouse2D.z = 0.5;


        var mouse3D = mouse2D.clone().unproject(_controller.camera);
        return mouse3D;
    }

    function keyPressEvent(event){
        if(event.keyCode == 13){

            if($annotationText.value === '') return;

            _controller.annotation.text = $annotationText.value;
            _controller.annotation.color = randomColor();

            sceneController.addAnnotation(_controller.annotation);
            appController.sendNewAnnotation(_controller.annotation);

            $annotationText.value = '';

            $annotationText.classList.add('hidden');
        }
    }

    this.renderer.domElement.addEventListener('mouseup', function (event) {
        event.preventDefault();


        var mouse3D = getMousePosition(event.clientX, event.clientY);

        var x = mouse3D.x * 100;
        var y = mouse3D.y * 100;
        var z = mouse3D.z * 100;

        console.log('touch:' + x + ' ' + y + ' ' + z);

        var annotation = {text: '<text>', x: x, y: y, z: z};

        _controller.annotation = annotation;

        $annotationText.classList.remove('hidden');
        $annotationText.focus();

        $annotationText.removeEventListener('keypress', keyPressEvent);
        $annotationText.addEventListener('keypress', keyPressEvent);

    }, false);
};


SceneController.prototype.startSharing = function () {
    this.removeGuide();
    this.removeCorners();

    this.isSharingOrientation = true;
};

SceneController.prototype.renderGuide = function () {
    var geometry = new THREE.BoxGeometry( 100, 100, 100, 4, 4, 4 );
    var material = new THREE.MeshBasicMaterial( { color: 0xff00ff, side: THREE.BackSide, wireframe: true } );
    var mesh = new THREE.Mesh( geometry, material );
    this.guideMesh = mesh;
    this.scene.add( mesh );
};

SceneController.prototype.removeGuide = function () {
    this.scene.remove(this.guideMesh);
    this.guideMesh = null;
};

SceneController.prototype.removeCorners = function () {
    this.scene.remove(this.cornersGroup);
    this.cornersGroup = null;
};

SceneController.prototype.addText = function (font, text, x, y, z, color, size) {
    var geometry = new THREE.TextGeometry(text, {
        font: font,
        size: size || 10,
        height: 5,
        curveSegments: 2
    });

    geometry.computeBoundingBox();

    var material = new THREE.MeshBasicMaterial({
        transparent: true,
        color: color,
        side: THREE.BackSide
    });

    var mesh = new THREE.Mesh(geometry, material);

    mesh.position.x = x;
    mesh.position.y = y;
    mesh.position.z = z;

    mesh.lookAt(this.camera.position);
    return mesh;
};

SceneController.prototype.addAnnotation = function (annotation) {

    if(this.isVideoEnabled){
        this.addVideoTag(annotation.text, annotation.x, annotation.y, annotation.z, annotation.color);
    }

    if(this.isListEnabled){
        this.addListTag(annotation.text, annotation.color);
    }
};

SceneController.prototype.addCircle = function () {
    this.circleGroup = new THREE.Group();

    var segmentCount = 180,
        radius = 100,
        geometry = new THREE.Geometry(),
        material = new THREE.LineBasicMaterial({ color: 0x00FF00 });

    for (var i = 0; i <= segmentCount; i++) {
        var theta = (i / segmentCount) * Math.PI * 2;
        var position = new THREE.Vector3(
            Math.cos(theta) * radius,
            0,
            Math.sin(theta) * radius);
        geometry.vertices.push(position);

        var n = i - 90;

        var mesh = this.addText(this.font, n, position.x, position.y, position.z, '#00FF00', 1);
        this.circleGroup.add(mesh);
    }

    this.circleGroup.add(new THREE.Line(geometry, material));
    this.scene.add(this.circleGroup);
};

SceneController.prototype.addCorners = function () {
    this.cornersGroup = new THREE.Group();

    var corners = [
        {"text":"R", "x": -399.80592126580785 	,"y": 135.56151896989346 	,"z":9.996038694659928},
        {"text":"R", "x": -421.60113221761765 	,"y": -51.433631176966664 	,"z":-1.2337488749180532},
        {"text":"L", "x": 381.9170058246843 	,"y": 142.8421423431942 	,"z":125.77672660930543},
        {"text":"L", "x": 394.2499678869994 	,"y": -71.65688176722026 	,"z":134.7154999615671}
    ];

    var ctrl = this;
    _.each(corners, function (corner) {
        var mesh = ctrl.addText(ctrl.font, corner.text, corner.x, corner.y, corner.z, '#cccccc', 5);
        ctrl.cornersGroup.add(mesh);
    });

    this.scene.add(this.cornersGroup);

    this.addCircle();
};


SceneController.prototype.addListTag = function (text, color) {

    var $history = jQuery('#annotation-history');
    var $item = jQuery('<div />', {'class': 'history-item', 'style': 'color: ' + color}).text(text)
        .appendTo($history);

    $history.scrollTop($history.prop("scrollHeight"));

    $item.fadeTo(this._fadeOutMs, 0, function () {
        // console.log('fading complete');
        $item.remove();
    });

};


SceneController.prototype.addVideoTag = function (text, x, y, z, color) {
    var mesh = this.addText(this.font, text, x, y, z, color);
    var group = new THREE.Group();
    group.add(mesh);
    this.scene.add(group);

    var ctrl = this;
    var scene = this.scene;

    var intervalId = setInterval(function () {
        if(mesh.material.opacity >0){
            mesh.material.opacity  = mesh.material.opacity - ctrl._fadeOutFactor;
            // console.log('opacity: ' + mesh.material.opacity + ' for: ' + text);
        }
        else{
            scene.remove(group);
            // console.log('removed: ' + text);
            clearInterval(intervalId);
        }
    }, ctrl._fadeOutInterval);

};

var sceneController;

window.addEventListener('load', function () {
    sceneController = new SceneController();

}, false);
var SceneController = function () {
    var container, camera, scene, renderer, controls;

    var _lastOrientation = null;

    var clock = new THREE.Clock();

    var _controller = this;

    var _lastUpdate = Date.now();

    var updateOrientation = function (vOrientation) {
        _lastOrientation = new THREE.Vector3();
        _lastOrientation.copy(vOrientation);

        _lastUpdate = Date.now();
    };

    var animate = function () {

        window.requestAnimationFrame(animate);

        var orientation = controls.update();

        renderer.render(scene, camera);

        if(orientation && (Date.now() - _lastUpdate > 300)){

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

                    console.log(orientation);
                    appController.updateOrientation(orientation);

                    updateOrientation(vOrientation);
                }
            }

            //appController.updateOrientation(orientation);
        }
    };

    container = document.getElementById('container');

    this.camera = camera = new THREE.PerspectiveCamera(23, window.innerWidth / window.innerHeight, 1, 1100);

    window.controls = controls = new THREE.DeviceOrientationControls(camera);

    this.scene = scene = new THREE.Scene();

    var geometry = new THREE.SphereGeometry(500, 16, 8);
    geometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));

    // TEXT

    var loader = new THREE.FontLoader();


    loader.load('/lib/arial.typeface.js', function (font) {
        _controller.font = _font = font;

        console.log('font loaded');
    });


    renderer = new THREE.WebGLRenderer({alpha: true});
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

    $('#data-text-start').addEventListener('click', function () {
        controls.connect();
    });


    function getMousePosition(clientX, clientY) {
        var mouse2D = new THREE.Vector3();

        mouse2D.x = (clientX / window.innerWidth) * 2 - 1;
        mouse2D.y = -(clientY / window.innerHeight) * 2 + 1;
        mouse2D.z = 0.5;


        var mouse3D = mouse2D.clone().unproject(camera);
        return mouse3D;
    }

    var h = jQuery('body').height();
    jQuery('#annotation-history').css('max-height', h);


    // _controller.annotation = {x: 0, y: 0, z: 0};

    var $annotationText = $('#annotation-text');

    function keyPressEvent(event){
        if(event.keyCode == 13){

            if($annotationText.value === '') return;

            _controller.annotation.text = $annotationText.value;
            _controller.annotation.color = randomColor();

            sceneController.addAnnotation(_controller.annotation);
            appController.sendNewAnnotation(_controller.annotation);

            $annotationText.value = '';

        }
    }

    renderer.domElement.addEventListener('mouseup', function (event) {
       event.preventDefault();

       var mouse3D = getMousePosition(event.clientX, event.clientY);

       var x = mouse3D.x * 100;
       var y = mouse3D.y * 100;
       var z = mouse3D.z * 100;

       console.log(x + ' ' + y + ' ' + z);

       var annotation = {text: '<text>', x: x, y: y, z: z};

       _controller.annotation = annotation;

        $annotationText.classList.remove('hidden');
        $annotationText.focus();

        $annotationText.removeEventListener('keypress', keyPressEvent);
        $annotationText.addEventListener('keypress', keyPressEvent);


    }, false);

};

SceneController.prototype.addText = function (font, text, x, y, z, color) {
    var geometry = new THREE.TextGeometry(text, {
        font: font,
        size: 10,
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
    this.addTag(annotation.text, annotation.x, annotation.y, annotation.z, annotation.color);

    var $history = jQuery('#annotation-history');
    jQuery('<div />', {'class': 'history-item', 'style': 'color: ' + annotation.color}).text(annotation.text)
        .appendTo($history);

    $history.scrollTop($history.prop("scrollHeight"));
};

SceneController.prototype.addTag = function (text, x, y, z, color) {
    var mesh = this.addText(this.font, text, x, y, z, color);
    var group = new THREE.Group();
    group.add(mesh);
    this.scene.add(group);

    var scene = this.scene;

    var intervalId = setInterval(function () {
        if(mesh.material.opacity >0){
            mesh.material.opacity  = mesh.material.opacity - 0.05;
            console.log('opacity: ' + mesh.material.opacity + ' for: ' + text);
        }
        else{
            scene.remove(group);
            console.log('removed' + text);
            clearInterval(intervalId);
        }
    }, 300);

};


var sceneController;

window.addEventListener('load', function () {
    sceneController = new SceneController();
}, false);
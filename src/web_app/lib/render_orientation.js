var SceneController = function () {
    var container, camera, scene, renderer, controls;


    var clock = new THREE.Clock();

    var controller = this;

    var animate = function () {

        window.requestAnimationFrame(animate);

        var orientation = controls.update();
        appController.setOrientation(orientation);

        renderer.render(scene, camera);
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
        controller.font = _font = font;

        controller.addTag('hello', 0, 0, 200);
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

    //controls.connect();
    //appController.startSendingOrientation();
    animate();

    $('#data-text-start').onclick = function () {
        controls.connect();
        appController.startSendingOrientation();
    };

    function render() {

        var delta = clock.getDelta();

        mixer.update(delta);

        for (var i = 0; i < morphs.length; i++) {

            morph = morphs[i];

            morph.position.x += morph.speed * delta;

            if (morph.position.x > 2000) {

                morph.position.x = -1000 - Math.random() * 500;

            }

        }

        controls.update(delta);


        renderer.clear();
        renderer.render(scene, camera);

        // Render debug HUD with shadow map

        if (showHUD) {

            renderer.clearDepth();
            renderer.render(sceneHUD, cameraOrtho);

        }

    }


    function getMousePosition(clientX, clientY) {
        var mouse2D = new THREE.Vector3();

        mouse2D.x = (clientX / window.innerWidth) * 2 - 1;
        mouse2D.y = -(clientY / window.innerHeight) * 2 + 1;
        mouse2D.z = 0.5;


        var mouse3D = mouse2D.clone().unproject(camera);
        return mouse3D;
    }




    renderer.domElement.addEventListener('mouseup', function (event) {
        event.preventDefault();

        var mouse3D = getMousePosition(event.clientX, event.clientY);

        var x = mouse3D.x * 100;
        var y = mouse3D.y * 100;
        var z = mouse3D.z * 100;

        console.log(x + ' ' + y + ' ' + z);

        var annotation = {text: 'hi', x: x, y: y, z: z};

        sceneController.addAnnotation(annotation);
        appController.sendNewAnnotation(annotation);
    }, false);
};

SceneController.prototype.addText = function (font, text, x, y, z) {
    var geometry = new THREE.TextGeometry(text, {
        font: font,
        size: 10,
        height: 5,
        curveSegments: 2
    });

    geometry.computeBoundingBox();

    var material = new THREE.MeshBasicMaterial({
        color: 0xff00ff,
        side: THREE.BackSide,
        wireframe: true
    });

    var mesh = new THREE.Mesh(geometry, material);

    mesh.position.x = x;
    mesh.position.y = y;
    mesh.position.z = z;

    mesh.lookAt(this.camera.position);
    return mesh;
};

SceneController.prototype.addAnnotation = function (annoation) {
  this.addTag(annoation.text, annoation.x, annoation.y, annoation.z);
};

SceneController.prototype.addTag = function (text, x, y, z) {
    var mesh = this.addText(this.font, text, x, y, z);
    var group = new THREE.Group();
    group.add(mesh);
    this.scene.add(group);
};


var sceneController;

window.addEventListener('load', function () {
    sceneController = new SceneController();
}, false);
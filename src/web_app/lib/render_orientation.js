var SceneController = function () {
    var container, camera, scene, renderer, controls;

    var _font;
    var clock = new THREE.Clock();

    var animate = function () {

        window.requestAnimationFrame(animate);

        var orientation = controls.update();
        appController.setOrientation(orientation);

        renderer.render(scene, camera);
    };

    container = document.getElementById('container');

    camera = new THREE.PerspectiveCamera(23, window.innerWidth / window.innerHeight, 1, 1100);

    window.controls = controls = new THREE.DeviceOrientationControls(camera);

    scene = new THREE.Scene();

    var geometry = new THREE.SphereGeometry(500, 16, 8);
    geometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));

    // TEXT

    var loader = new THREE.FontLoader();

    function addText(font, text, x, y, z) {
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

        mesh.lookAt(camera.position);
        return mesh;
    }

    function addTag(text, x, y, z) {
        var mesh = addText(_font, text, x, y, z);
        var group = new THREE.Group();
        group.add(mesh);
        scene.add(group);

        appController.sendNewAnnotation({text: text, x: x, y: y, z: z});
    }

    loader.load('/lib/arial.typeface.js', function (font) {
        _font = font;

        addTag('hello', 0, 0, 200);
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
        var mouse3D = new THREE.Vector3();

        var projector = new THREE.Projector();

        mouse2D.x = (clientX / window.innerWidth) * 2 - 1;
        mouse2D.y = -(clientY / window.innerHeight) * 2 + 1;
        mouse2D.z = 0.5;

        //mouse3D = projector.unprojectVector(mouse2D.clone(), camera);

        mouse3D = mouse2D.clone().unproject(camera);
        return mouse3D;

        //var vector = new THREE.Vector3(
        //    (clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1,
        //    0.5);
        //
        ////projector.unprojectVector(vector, camera);
        //vector.unproject(camera);
        //
        //var dir = vector.sub(camera.position).normalize();
        //var distance = -camera.position.z / dir.z;
        //var pos = camera.position.clone().add(dir.multiplyScalar(distance));
        //return pos;
    }


    function onDocumentMouseUp(event) {
        event.preventDefault();

        var mouse3D = getMousePosition(event.clientX, event.clientY);

        var x = mouse3D.x * 100;
        var y = mouse3D.y * 100;
        var z = mouse3D.z * 100;

        console.log(x + ' ' + y + ' ' + z);

        addTag('hi', x, y, z);

        //var vector = new THREE.Vector3( mouse3D.x, mouse3D.y, 1 );
        //raycaster.set( camera.position, vector.sub( camera.position ).normalize() );
        //
        //var intersects = raycaster.intersectObjects(scene.children );
        //if(intersects.length > 0){
        //    console.log(intersects[0].object.position);
        //}
    }

    renderer.domElement.addEventListener('mouseup', onDocumentMouseUp, false);
};

var sceneController;

window.addEventListener('load', function () {
    sceneController = new SceneController();
}, false);
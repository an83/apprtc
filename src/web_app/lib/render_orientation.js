window.addEventListener('load', function () {

    var container, camera, scene, renderer, controls;

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

    function AddText(font, text, x, y, z) {
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

    loader.load('/lib/arial.typeface.js', function (font) {
        var mesh = AddText(font, 'hello', 0, 0, 200);

        var group = new THREE.Group();

        group.add(mesh);
        scene.add(group);
    });


    renderer = new THREE.WebGLRenderer( { alpha: true } );
    renderer.setClearColor( 0x000000, 0 ); // the default

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

}, false);
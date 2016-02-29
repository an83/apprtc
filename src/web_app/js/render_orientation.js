window.addEventListener('load', function () {

    var container, camera, scene, renderer, controls, geometry, mesh;

    var clock = new THREE.Clock();

    var animate = function () {

        window.requestAnimationFrame(animate);

        controls.update();
        renderer.render(scene, camera);

    };

    container = document.getElementById('container');

    camera = new THREE.PerspectiveCamera(23, window.innerWidth / window.innerHeight, 1, 1100);

//            camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );
//            camera.position.set( 0, 0, 0 );


    controls = new THREE.DeviceOrientationControls(camera);

    scene = new THREE.Scene();

    var geometry = new THREE.SphereGeometry(500, 16, 8);
    geometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));

//            var material = new THREE.MeshBasicMaterial( {
//                map: THREE.ImageUtils.loadTexture( 'textures/2294472375_24a3b8ef46_o.jpg' )
//            } );

    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    var geometry = new THREE.BoxGeometry(100, 100, 100, 4, 4, 4);
    var material = new THREE.MeshBasicMaterial({
        color: 0xff00ff,
        side: THREE.BackSide,
        wireframe: true
    });

    var mesh = new THREE.Mesh(geometry, material);
//            scene.add( mesh );


    // TEXT

    var loader = new THREE.FontLoader();
    loader.load('arial.typeface.js', function (font) {

        var geometry = new THREE.TextGeometry("Hello", {

            font: font,
            size: 10,
            height: 5,
            curveSegments: 2

        });

        geometry.computeBoundingBox();

        var centerOffset = -0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );

        var material = new THREE.MeshBasicMaterial({
            color: 0xff00ff,
            side: THREE.BackSide,
            wireframe: true
        });

//                var material = new THREE.MultiMaterial( [
//                    new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff, overdraw: 0.5 } ),
//                    new THREE.MeshBasicMaterial( { color: 0x000000, overdraw: 0.5 } )
//                ] );

        var mesh = new THREE.Mesh(geometry, material);

        mesh.position.x = 200;
        mesh.position.y = 200;
        mesh.position.z = 200;

//                mesh.rotation.x = 0;
//                mesh.rotation.y = Math.PI * 2;

        mesh.lookAt(camera.position);


        var group = new THREE.Group();
        group.add(mesh);

        scene.add(group);

    });

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = 0;
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', function () {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);

    }, false);

    controls.connect();

    animate();


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
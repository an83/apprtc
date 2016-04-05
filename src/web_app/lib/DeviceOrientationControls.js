/**
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

THREE.DeviceOrientationControls = function ( object ) {

    var scope = this;

    this.object = object;

    this.object.rotation.reorder( "YXZ" );

    this.freeze = true;

    this.deviceOrientation = {};

    this.screenOrientation = 0;

    var onDeviceOrientationChangeEvent = function ( event ) {

        scope.deviceOrientation = event;

    };

    var onScreenOrientationChangeEvent = function () {

        scope.screenOrientation = window.orientation || 0;

    };

    // The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

    var setObjectQuaternion = function () {

        var zee = new THREE.Vector3( 0, 0, 1 );

        var euler = new THREE.Euler();

        var q0 = new THREE.Quaternion();

        var q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

        return function ( quaternion, alpha, beta, gamma, orient ) {

            euler.set( beta, alpha, - gamma, 'YXZ' );                       // 'ZXY' for the device, but 'YXZ' for us

            quaternion.setFromEuler( euler );                               // orient the device

            quaternion.multiply( q1 );                                      // camera looks out the back of the device, not the top

            quaternion.multiply( q0.setFromAxisAngle( zee, - orient ) );    // adjust for screen orientation

        }

    }();

    this.connect = function() {

        onScreenOrientationChangeEvent(); // run once on load

        window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
        window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

        scope.freeze = false;

    };

    this.disconnect = function() {

        scope.freeze = true;

        window.removeEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
        window.removeEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

    };

    var history = [];

    this.update = function () {

        if ( scope.freeze ) return;

        var alpha  = scope.deviceOrientation.alpha ? THREE.Math.degToRad( scope.deviceOrientation.alpha ) : 0; // Z
        var beta   = scope.deviceOrientation.beta  ? THREE.Math.degToRad( scope.deviceOrientation.beta  ) : 0; // X'
        var gamma  = scope.deviceOrientation.gamma ? THREE.Math.degToRad( scope.deviceOrientation.gamma ) : 0; // Y''
        var orient = scope.screenOrientation       ? THREE.Math.degToRad( scope.screenOrientation       ) : 0; // O

        if(history.length > 25){

            history.splice(0,1);  //remove the first item in the array
            history.push([alpha, beta + 180, gamma + 90]);   //adjust to start from 0

            var sum = [0,0,0];
            for(var i=0; i<history.length; i++){
                var o = history[i];
                sum[0] += o[0];
                sum[1] += o[1];
                sum[2] += o[2];
            }

            var avg = [
                sum[0]/history.length,
                sum[1]/history.length -180,
                sum[2]/history.length - 90
            ];

            console.log('avg: ' + JSON.stringify(avg));

            alpha = avg[0];
            beta = avg[1];
            gamma = avg[2];
        }
        else{
            history.push([alpha, beta + 180, gamma + 90]);   //adjust to start from 0
        }

        setObjectQuaternion( scope.object.quaternion, alpha, beta, gamma, orient );

        return [alpha, beta, gamma, orient];
    };


    this.setOrientation = function (orientation) {

        setObjectQuaternion( scope.object.quaternion, orientation[0],orientation[1],orientation[2],orientation[3]);
    }

};

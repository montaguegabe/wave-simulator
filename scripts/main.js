var container, stats;

            var camera, scene, renderer;
            var equationString = "none";
            var myShape, cube, plane;

            // Parametrics
            var xFunction, yFunction, zFunction;
            var tMin, tMax, tResolution;
            var uMin, uMax, uResolution;
            var heights = new Array();
            var vels = new Array();

            var playing = false;
            var realistic = false;

            tMin = -30;
            tMax = 30;
            tResolution = 120;
            uMin = -30;
            uMax = 30;
            uResolution = 120;
            var tInc = (tMax - tMin) / tResolution;
            var uInc = (uMax - uMin) / uResolution;

            var phi = 3.14159 * 0.3;
            var rho = 25;
            var theta = 0;
            var targetRotation = 0;
            var targetRotationUp = phi;
            var targetRotationOnMouseDown = 0;
            var targetRotationUpOnMouseDown = phi;

            var mouseX = 0;
            var mouseY = 0;
            var mouseXOnMouseDown = 0;
            var mouseYOnMouseDown = 0;

            var windowHalfX = window.innerWidth / 2;
            var windowHalfY = window.innerHeight / 2;

            var period = 5;
            var heatFactor = 0.2;
            var stableBoundary = false;
            var zeroBoundary = false;
            var modeWave = 0;
            var modeHeat = 1;
            var modeMix = 2;
            var mode = modeMix;
            var heatWaveFactor = 0.95;

            init();
            animate();

            function initialFunction(x, y) {
                // x -= 10;
                // y += 7;

                // Single hump + sine
                //return Math.exp(-(x*x + y*y) / 50) * 12 + Math.sin(x / 10) * 10;

                // 
                //return x * y / 50;

                //if (x == 25 && y == 25) {
                //    return 60; 
                //}
                //return 0;

                // Double hump
                var retValue = Math.exp(-(x*x + y*y) / 50) * 12;
                x += 25;
                y -= 7;
                retValue += Math.exp(-(x*x + y*y) / 35) * 12;
                return retValue;
                //return Math.cos(x / 20) * 60;
                //return Math.sin((x + y) / 20) * 60;
                //return Math.sin((x) / 10) * 4;

                //if (x > -150 && x < 150 && y > -150 && y < 150) return 80;
                //else return 0;
            }

            function initialVelocity(x, y) {
                //return Math.exp(-(x*x + y*y) / 1200) * 25;
                //return Math.sin(x / 20) * 1;
                return 0;
            }

            function init() {

                container = document.getElementById("view-3d");
                document.body.appendChild(container);

                camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 1000 );
                camera.position.y = 150;
                camera.position.z = 300;

                scene = new THREE.Scene();

                // LIGHTS

                var ambient = new THREE.AmbientLight(0xffffff);
                scene.add( ambient );

                dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
                dirLight.position.y = 0.75;
                dirLight.position.z = 1;
                //scene.add( dirLight );

                var path = "img/cube/park2/";
                var format = '.jpg';
                var urls = [
                        path + 'px' + format, path + 'nx' + format,
                        path + 'py' + format, path + 'ny' + format,
                        path + 'pz' + format, path + 'nz' + format
                ];

                var reflectionCube = THREE.ImageUtils.loadTextureCube( urls );
                reflectionCube.format = THREE.RGBFormat;

                var refractionCube = THREE.ImageUtils.loadTextureCube( urls );
                refractionCube.mapping = THREE.CubeRefractionMapping;
                refractionCube.format = THREE.RGBFormat;

                //var cubeMaterial3 = new THREE.MeshPhongMaterial( { color: 0x000000, specular:0xaa0000, envMap: reflectionCube, combine: THREE.MixOperation, reflectivity: 0.25 } );
                var cubeMaterial3 = new THREE.MeshLambertMaterial( { color: 0xff6600, envMap: reflectionCube, combine: THREE.MixOperation, reflectivity: 0.3 } );
                var cubeMaterial2 = new THREE.MeshLambertMaterial( { color: 0xffee00, envMap: refractionCube, refractionRatio: 0.95 } );
                var cubeMaterial1 = new THREE.MeshPhongMaterial( { color: 0xFFFFFF, envMap: reflectionCube, reflectivity: 0.99, specular: 0xAAAAAA, shininess: 1000 } );
                cubeMaterial1.metal = true;
                //var cubeMaterial1 = new THREE.MeshLambertMaterial( { color: 0x222222 } );


                // Skybox

                var shader = THREE.ShaderLib[ "cube" ];
                shader.uniforms[ "tCube" ].value = reflectionCube;

                var material = new THREE.ShaderMaterial( {

                    fragmentShader: shader.fragmentShader,
                    vertexShader: shader.vertexShader,
                    uniforms: shader.uniforms,
                    depthWrite: false,
                    side: THREE.BackSide

                } ),

                mesh = new THREE.Mesh( new THREE.BoxGeometry( 1000, 1000, 1000 ), material );
                if (realistic) scene.add( mesh );

                // Shape
                var geometry = new THREE.Geometry();

                var eps = 0.001;

                for (var i = 0; i <= tResolution; i++) {
                    row = new Array();
                    rowVels = new Array();
                    var t = i * (tMax - tMin) / tResolution + tMin;

                    for (var j = 0; j <= uResolution; j++) {
                        var u = j * (uMax - uMin) / uResolution + uMin;
                        if (!zeroBoundary || (i != 0 && j != 0 && i != tResolution && j != uResolution)) {
                            row.push(initialFunction(t, u));
                            rowVels.push(initialVelocity(t, u));
                        } else {
                            row.push(0);
                            rowVels.push(0);
                        }
                    };

                    heights.push(row);
                    vels.push(rowVels);
                };

                xFunction = function(t, u) {
                    return t;
                }
                yFunction = function(t, u) {
                    var i = Math.floor((t - tMin) / (tMax - tMin) * tResolution);
                    var j = Math.floor((u - uMin) / (uMax - uMin) * uResolution);
                    return heights[i][j];
                }
                zFunction = function(t, u) {
                    return u;
                }

                // Construct the shape
                var vInd = 0;
                var fInd = 0;
                var newX, newY, newZ;
                var yPrevious = 0;
                for (var t = tMin; t <= tMax + eps; t += tInc) {

                    for (var u = uMin; u <= uMax + eps; u += uInc) {

                        newX = xFunction(t, u);
                        yPrevious = newY;
                        newY = yFunction(t, u);
                        newZ = zFunction(t, u);
                        vert = new THREE.Vector3(newX, newY, newZ);

                        geometry.vertices.push(vert);

                        // Add new face if enough verts have been added
                        if (t != tMin && u != uMin) {
                            // tNuN = vInd
                            // tNuO = vInd - 1
                            // tOuN = vInd - uResolution - 1
                            // tOuO = vInd - uResolution - 2

                            // f1 is tNuN, tOuO, tOuN
                            // f2 is tNuN, tNuO, tOuO

                            f1 = new THREE.Face3(vInd, vInd - uResolution - 2, vInd - uResolution - 1);
                            f2 = new THREE.Face3(vInd, vInd - 1, vInd - uResolution - 2);
                            geometry.faces.push(f1, f2);
                            fInd += 2;

                            // Create the colors that go with the faces
                            var tNuNColor = new THREE.Color(0xffffff);
                            var tNuOColor = new THREE.Color(0xffffff);
                            var tOuNColor = new THREE.Color(0xffffff);
                            var tOuOColor = new THREE.Color(0xffffff);

                            tNuNColor.setHSL(newY / 13.0, 0.7, 0.7);
                            tNuOColor.setHSL(yPrevious / 13.0, 0.7, 0.7);
                            tOuNColor.setHSL(geometry.vertices[vInd - uResolution - 1].y / 13.0, 0.7, 0.7);
                            tOuOColor.setHSL(geometry.vertices[vInd - uResolution - 2].y / 13.0, 0.7, 0.7);

                            f1.vertexColors[0] = f2.vertexColors[0] = tNuNColor;
                            f1.vertexColors[1] = f2.vertexColors[2] = tOuOColor;
                            f2.vertexColors[1] = tNuOColor;
                            f1.vertexColors[2] = tOuNColor;
                        }

                        vInd++;
                    }
                };

                geometry.computeFaceNormals();
                geometry.computeVertexNormals();

                var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors, overdraw: 0.5 } );

                myShape = new THREE.Mesh( geometry, realistic ? cubeMaterial1 : material );
                myShape.position.y = 0;
                scene.add( myShape );

                // Plane

                var geometry = new THREE.PlaneBufferGeometry( 200, 200 );
                geometry.rotateX( - Math.PI / 2 );

                var material = new THREE.MeshBasicMaterial( { color: 0xe0e0e0, overdraw: 0.5 } );

                renderer = new THREE.WebGLRenderer();
                renderer.setClearColor( 0xf0f0f0 );
                renderer.setPixelRatio( window.devicePixelRatio );
                renderer.setSize(800, 600);
                renderer.autoClear = false;
                container.appendChild( renderer.domElement );

                stats = new Stats();
                stats.domElement.style.position = 'absolute';
                stats.domElement.style.top = '0px';
                container.appendChild( stats.domElement );

                document.addEventListener( 'mousedown', onDocumentMouseDown, false );
                document.addEventListener( 'touchstart', onDocumentTouchStart, false );
                document.addEventListener( 'touchmove', onDocumentTouchMove, false );

                //

                window.addEventListener('resize', onWindowResize, false);

                document.addEventListener('keydown', onKeyDown, false);

            }

            function onKeyDown(e) {

                var keynum;
                if (window.event) { // IE                   
          keynum = e.keyCode;
        } else if(e.which) { // Netscape/Firefox/Opera                  
          keynum = e.which;
        }

                switch (keynum) {
                    case 32:
                        playing = !playing;
                        break;

                    case 38:
                        //edges = new THREE.FaceNormalsHelper( myShape, 2, 0x00ff00, 1 );
                        //scene.add(edges);
                        rho -= 2.5;
                        break;

                    case 40:
                        rho += 2.5;
                        break;

                    case 65:
                        var i0 = Math.round(Math.random() * tResolution);
                        var j0 = Math.round(Math.random() * uResolution);
                        var radius = Math.random() * 50 + 2;
                        var sqRad = radius * radius;
                        var height = 2.0 + Math.random() * 16.0;
                        var indexLimitT = Math.ceil(radius / tResolution);
                        var indexLimitU = Math.ceil(radius / uResolution);

                        for (var i = i0 - indexLimitT; i < i0 + indexLimitT; i++) {
                            for (var j = j0 - indexLimitU; j < j0 + indexLimitU; j++) {
                                
                                if (i < 1 || i >= tResolution || j < 1 || j >= uResolution) {
                                    continue;
                                }

                                var dx = (i - i0) * tInc;
                                var dy = (j - j0) * uInc;
                                if (dx * dx + dy * dy < sqRad || true) {
                                    vels[i][j] = height;
                                }
                            }
                        }

                        break;

                    case 83:

                        for (var i = 1; i < tResolution; i++) {
                            for (var j = 1; j < uResolution; j++) {

                                vels[i][j] = (i - Math.round(tResolution / 2)) * tInc / 800;
                            }
                        }

                        break;
                }
            }

            function onWindowResize() {

                return;

                windowHalfX = window.innerWidth / 2;
                windowHalfY = window.innerHeight / 2;

                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();

                renderer.setSize( window.innerWidth, window.innerHeight );

            }

            //

            function onDocumentMouseDown( event ) {

                //event.preventDefault();

                document.addEventListener( 'mousemove', onDocumentMouseMove, false );
                document.addEventListener( 'mouseup', onDocumentMouseUp, false );
                document.addEventListener( 'mouseout', onDocumentMouseOut, false );

                mouseXOnMouseDown = event.clientX - windowHalfX;
                mouseYOnMouseDown = event.clientY - windowHalfY;
                targetRotationOnMouseDown = targetRotation;
                targetRotationUpOnMouseDown = targetRotationUp;
            }

            function onDocumentMouseMove( event ) {

                mouseX = event.clientX - windowHalfX;
                mouseY = event.clientY - windowHalfY;

                targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;
                targetRotationUp = targetRotationUpOnMouseDown + ( mouseY - mouseYOnMouseDown ) * 0.01;

            }

            function onDocumentMouseUp( event ) {

                document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
                document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
                document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

            }

            function onDocumentMouseOut( event ) {

                document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
                document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
                document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

            }

            function onDocumentTouchStart( event ) {

                if ( event.touches.length === 1 ) {

                    event.preventDefault();

                    mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
                    targetRotationOnMouseDown = targetRotation;
                    mouseYOnMouseDown = event.touches[ 0 ].pageY - windowHalfY;
                    targetRotationUpOnMouseDown = targetRotationUp;

                }

            }

            function onDocumentTouchMove( event ) {

                if ( event.touches.length === 1 ) {

                    event.preventDefault();

                    mouseX = event.touches[ 0 ].pageX - windowHalfX;
                    targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.05;
                    mouseY = event.touches[ 0 ].pageY - windowHalfY;
                    targetRotationUp = targetRotationUpOnMouseDown + ( mouseY - mouseYOnMouseDown ) * 0.05;

                }

            }

            function atIndex(array, index1, index2, def) {

                if (index1 < 0 || index1 >= array.length) {
                    return def;
                }
                var sub = array[index1];
                if (index2 < 0 || index2 >= sub.length) {
                    return def;
                }
                return array[index1][index2];
            }

            function animate() {

                requestAnimationFrame( animate );

                if (playing) {

                    var verts = myShape.geometry.vertices;
                    var faces = myShape.geometry.faces;
                    var vInd = 0;
                    var fInd = 0;

                    // Normals
                    var cb = new THREE.Vector3(), ab = new THREE.Vector3();

                    for (var i = 0; i <= tResolution + 2; i++) {

                        //var t = i * (tMax - tMin) / tResolution + tMin;

                        for (var j = 0; j <= uResolution + 2; j++) {

                            if (i > 1 && j > 1) {

                                heights[i - 2][j - 2] += vels[i - 2][j - 2];
                                
                                var vector = verts[vInd];
                                verts[vInd].set(vector.x, heights[i - 2][j - 2], vector.z);
                                //verts[vInd].set(vector.x, -20, vector.z);
                                vInd++;
                            }

                            if (i > tResolution || j > uResolution) {
                                continue;
                            }

                            //var u = j * (uMax - uMin) / uResolution + uMin;
                            var laplace, fl, f, fr, fu, fd, fx1, fx2, fxx, fy1, fy2, fyy;

                            f = atIndex(heights, i, j, 0);
                            fu = atIndex(heights, i, j - 1, f);
                            fd = atIndex(heights, i, j + 1, f);
                            fr = atIndex(heights, i + 1, j, f);
                            fl = atIndex(heights, i - 1, j, f);

                            fx1 = fr - f;
                            fx2 = f - fl;
                            fxx = fx1 - fx2;

                            fy1 = fd - f;
                            fy2 = f - fu;
                            fyy = fy1 - fy2;
                            laplace = fxx + fyy;

                            if (mode == modeWave) vels[i][j] += laplace / period;
                            else if (mode == modeHeat) vels[i][j] = heatFactor * laplace;
                            else {
                                // Do both
                                var heatVel = heatFactor * laplace;
                                var waveVel = vels[i][j] + laplace / period;
                                vels[i][j] = (waveVel - heatVel) * heatWaveFactor + heatVel;
                            }

                            if (stableBoundary && (i == 0 || j == 0 || i == tResolution || j == uResolution)) {
                                vels[i][j] = 0;
                            }

                            if (i != tResolution && j != uResolution) {
                                var f1 = faces[fInd];
                                var f2 = faces[fInd + 1];

                                // f1 is tNuN, tOuO, tOuN
                                // f2 is tNuN, tNuO, tOuO

                                var tNuNColor = f1.vertexColors[0];
                                var tOuOColor = f1.vertexColors[1];
                                var tNuOColor = f2.vertexColors[1];
                                var tOuNColor = f1.vertexColors[2];

                                tOuNColor.setHSL(fd / 11.0, 0.7, 0.7);
                                tOuOColor.setHSL(f / 11.0, 0.7, 0.7);
                                tNuOColor.setHSL(fr / 11.0, 0.7, 0.7);
                                var frd = atIndex(heights, i + 1, j + 1, 0);
                                tNuNColor.setHSL(frd / 11.0, 0.7, 0.7);

                                // Face 1 Normal
                                cb.x = 0;
                                cb.y = fd - f;
                                cb.z = uInc;
                                ab.x = tInc;
                                ab.y = frd - f;
                                ab.z = uInc;
                                cb.cross(ab);
                                cb.normalize();
                                f1.normal.copy(cb);

                                // Face 2 Normal
                                cb.x = -tInc;
                                cb.y = f - fr;
                                cb.z = 0;
                                ab.x = 0;
                                ab.y = frd - fr;
                                ab.z = uInc;
                                cb.cross(ab);
                                cb.normalize();
                                f2.normal.copy(cb);

                                fInd += 2;
                            }
                        }
                    }


                    if (realistic) {
                        myShape.geometry.computeVertexNormals();
                    }

                    myShape.geometry.verticesNeedUpdate = true;
                    myShape.geometry.colorsNeedUpdate = true;
                    myShape.geometry.normalsNeedUpdate = true;
                }

                render();
                stats.update();

            }

            function render() {

                var timer = -0.0002 * Date.now();

                //pointLight.position.x = 1500 * Math.cos( timer );
                //pointLight.position.z = 1500 * Math.sin( timer );

                theta += (targetRotation - theta) * 0.05;
                phi += ( targetRotationUp - phi) * 0.05;

                camera.position.x = Math.cos(theta) * Math.sin(phi) * rho;
                camera.position.z = Math.sin(theta) * Math.sin(phi) * rho;
                camera.position.y = Math.cos(phi) * rho;

                camera.lookAt(myShape.position);
                camera.updateProjectionMatrix();
                //cameraCube.rotation.copy( camera.rotation );

                renderer.render( scene, camera );

            }
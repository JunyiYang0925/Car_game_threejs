var scoreElement = document.getElementById("score");
var timeElement = document.getElementById("time");
var startGameTime;
var renderer,scene,stat,camera,light,ambientlight,plane;
var car,transparentBox,ballMesh,cubeMesh,wallGeometry,wallMaterial,wallLeft,wallRight;
var score = 0;
var keymap={}; //record keyboard event.
Physijs.scripts.worker = './js/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';
function render() {
    stat.begin();
    requestAnimationFrame( render );
    movement();
    chaseCamera();
    timeElement.innerHTML = ((Date.now() - startGameTime) / 1000).toFixed(2); //time that the game has started.
    renderer.render(scene,camera);
    scene.simulate();
    stat.end();
}
function keymapControl() {
    document.addEventListener('keydown',keyboarddown,false);
    document.addEventListener('keyup',keyboardup,false);
    function keyboarddown(){
        keymap[event.keyCode]=true;
    }
    function keyboardup() {
        keymap[event.keyCode]=false;
    }
}

function movement() {
    var speed = 0.8;
    var rotateSpeed = Math.PI/200;
    if (keymap[87]== true && keymap[65]==true){
        car.translateZ(-speed);
        car.rotation.y += rotateSpeed;
        transparentBox.translateX(-speed);
        transparentBox.rotation.y += rotateSpeed;
        //everytime if you want to update the position&rotation of the mesh build by physijs these two value should be set true.
        transparentBox.__dirtyPosition = true;
        transparentBox.__dirtyRotation = true;
    }
    else if (keymap[87]== true && keymap[68]==true){
        car.translateZ(-speed);
        car.rotation.y -= rotateSpeed;
        transparentBox.translateX(-speed);
        transparentBox.rotation.y -= rotateSpeed;
        transparentBox.__dirtyPosition = true;
        transparentBox.__dirtyRotation = true;
    }
    else if (keymap[83]== true && keymap[65]==true){
        car.translateZ(speed);
        car.rotation.y -= rotateSpeed;
        transparentBox.translateX(speed);
        transparentBox.rotation.y -= rotateSpeed;
        transparentBox.__dirtyPosition = true;
        transparentBox.__dirtyRotation = true;
    }
    else if (keymap[83]== true && keymap[68]==true){
        car.translateZ(speed);
        car.rotation.y += rotateSpeed;
        transparentBox.translateX(speed);
        transparentBox.rotation.y += rotateSpeed;
        transparentBox.__dirtyPosition = true;
        transparentBox.__dirtyRotation = true;
    }
    else if (keymap[87]== true){
        car.translateZ(-speed);
        transparentBox.translateX(-speed);
        transparentBox.__dirtyPosition = true;
        transparentBox.__dirtyRotation = true;
    }
    else if (keymap[83]==true){
        car.translateZ(speed);
        transparentBox.translateX(speed);
        transparentBox.__dirtyPosition = true;
        transparentBox.__dirtyRotation = true;
    }
}
function chaseCamera(){
    camera = new THREE.PerspectiveCamera(45, 4/3,1,1000);
    var carPositionOffset = new THREE.Vector3();
    carPositionOffset.setFromMatrixPosition(transparentBox.matrixWorld);
    camera.position.x = carPositionOffset.x+30;
    camera.position.y = carPositionOffset.y+17;
    camera.position.z = carPositionOffset.z;
    camera.lookAt(new THREE.Vector3(carPositionOffset.x, carPositionOffset.y+10, carPositionOffset.z));
    scene.add(camera);
}
function initLight() {
    //point light
    light = new THREE.PointLight(0xffffff,1,100,2);
    light.position.set(-20,40,20);
    light.castShadow = true;
    scene.add(light);

    //ambient light
    ambientlight = new THREE.AmbientLight(0xffffff,0.7);
    scene.add(ambientlight);
}
function initPlane() {

    //plane:
    var material = Physijs.createMaterial(new THREE.MeshLambertMaterial({
        map: THREE.ImageUtils.loadTexture('./img/ground.jpg',{},function(){
            renderer.render(scene,camera);
        })
    }),0.8,0,2);
    plane = new Physijs.BoxMesh(new THREE.BoxGeometry(5000, 1, 100),material,0);
    plane.position.y= 0;
    plane.receiveShadow=true;
    scene.add(plane);
}
function initCar() {
    //physijs can not detect external loaded model collision,
    // so use a transparent box travel with the car model for detecting collision of loaded car.
    var boxMaterial = new THREE.MeshLambertMaterial({
        transparent :true,
        opacity : 0
    });
    var boxGeometry = new THREE.CubeGeometry(25,5,10);
    transparentBox = new Physijs.BoxMesh(boxGeometry,boxMaterial,0.1);
    transparentBox.position.set(0,2.5,0);
    transparentBox.name = 'transparentBox';
    transparentBox.__dirtyPosition = true;
    transparentBox.__dirtyRotation = true;
    scene.add(transparentBox);

    //car loaded from obj file
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath('./lib/');
    mtlLoader.load('car.mtl',function (materials) {
        materials.preload();
        //load model
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('./lib/');
        objLoader.load('car.obj',function (object) {
            car = object;
            object.castShadow=true;
            object.rotation.y= Math.PI/2;
            object.position.set(0,0,0);
            object.scale.x = 0.006;
            object.scale.y = 0.006;
            object.scale.z = 0.006;
            object.matrixWorldNeedsUpdate = true;
            startGameTime = Date.now();
            setTimeout("timeUp()",1000*30);
            scene.add(object);
        })
    });
}
function initWall() {
    wallGeometry = new THREE.CubeGeometry(2500,3,1);
    wallMaterial = new THREE.MeshLambertMaterial({
        map: THREE.ImageUtils.loadTexture('./img/wall.jpg',{},function(){
            renderer.render(scene,camera);
        })
    });
    wallLeft = new Physijs.BoxMesh(wallGeometry,wallMaterial);
    wallLeft.position.set(-500,3,48);
    wallRight = new Physijs.BoxMesh(wallGeometry,wallMaterial);
    wallRight.position.set(-500,3,-48);
    wallLeft.addEventListener('collision', hitWall);
    wallRight.addEventListener('collision', hitWall);
    function hitWall(object, linearVelocity, angularVelocity) {
        if (this.collisioned || object.name != 'transparentBox'){
            return null;
        }
        else {
            if (!alert('GAME OVER, click ok to try again.')) {
                window.location.reload();
            }
        }
    }
    scene.add(wallLeft);
    scene.add(wallRight);
}
/*
function initAudio() {
    audios = {
        driving: '../audio/driving.mp3',
        bgm:     '../audio/bgm.mp3',
        crash:   '../audio/crash.mp3',
        score:   '../audio/score.mp3'
    };
    for (var key in sounds) {
        (function (key) {
            audioLoader.load(audios[key], function (buffer) {
                audios[key] = new THREE.PositionalAudio(listener);
                audios[key].setBuffer(buffer);
                audios[key].setRefDistance(10);
            });
        }(key))
    }
}
*/
function timeUp() {
    //game will be use in iframe, so when game is over, send a msg containing score to parent.
    var msg = {
        "messageType": "SCORE",
        "score": score
    };
    window.parent.postMessage(msg, "*");
    if(!alert('time is up, click ok to try again.')) {
        window.location.reload();
    }
}
function init(){
    //stats
    stat = new Stats();
    stat.domElement.style.position = 'absolute';
    stat.domElement.style.right = '0px';
    stat.domElement.style.top = '0px';
    document.body.appendChild(stat.domElement);

    // render&scene
    renderer = new THREE.WebGLRenderer({
        canvas:document.getElementById('mainCanvas')
    });
    renderer.setClearColor(0x000000);
    renderer.shadowMapSoft = true;
    renderer.shadowMapEnabled = true;
    scene = new Physijs.Scene();
    //save button clicked send a msg containing game state to parent.
    document.getElementById('saveButton').onclick= function () {
        var msg = {
            "messageType": "SAVE",
            "gameState": {
                "time":timeElement.innerHTML,
                "score": score
            }
        };
        window.parent.postMessage(msg, "*");
    };
    document.getElementById('loadButton').onclick= function(){
        var msg = {
            "messageType": "LOAD_REQUEST"
        };
        window.parent.postMessage(msg, "*");
    };
    window.addEventListener('message',function(event){
        var msg = event.data;
        if (msg.messageType=="LOAD"){
            scoreElement.innerHTML = msg.gameState.score;
        }
    },false);

    generateObstacle();
    initLight();
    initPlane();
    initWall();
    initCar();
    keymapControl();
    chaseCamera();
    render();
}

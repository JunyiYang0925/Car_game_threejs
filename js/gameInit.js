var scoreElement = document.getElementById("score");
var timeElement = document.getElementById("time");
var startTime = Date.now();
var renderer,scene,stat,camera,light,ambientlight,plane;
var car,transparentBox,ballMesh;
var score = 0;
var keymap={};
Physijs.scripts.worker = './js/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';
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
    setTimeout("timeUp()",1000*10);
    scene = new Physijs.Scene();
    generateObstacle();
    initLight();
    initPlane();
    initCar();
    keymapControl();
    chaseCamera();
    render();


}
function render() {
    stat.begin();
    requestAnimationFrame( render );
    movement();
    chaseCamera();
    //transparentBox.position.setFromMatrixPosition(car.matrixWorld);
    timeElement.innerHTML = ((Date.now() - startTime) / 1000).toFixed(2);
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
    var speed = 1;
    var rotateSpeed = Math.PI/200;
    if (keymap[87]== true && keymap[65]==true){
        car.translateZ(-speed);
        car.rotation.y += rotateSpeed;
        transparentBox.translateX(-speed);
        transparentBox.rotation.y += rotateSpeed;
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
    //var carPosition = new THREE.Vector3();
    //var carPositionOffset = carPosition.applyMatrix4(car.matrixWorld);
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
        map: THREE.ImageUtils.loadTexture('./img/2.jpg',{},function(){
            renderer.render(scene,camera);
        })
    }),0.8,0,2);
    plane = new Physijs.BoxMesh(new THREE.BoxGeometry(10000, 1, 100),material,0);
    //plane.rotation.x= -Math.PI/2;
    plane.position.y= 0;
    plane.receiveShadow=true;
    scene.add(plane);
}
function initCar() {
    //transparent box for detecting collision of loaded car.
    var boxMaterial = new THREE.MeshLambertMaterial({
        transparent :true,
        opacity : 1
    });
    var boxGeometry = new THREE.CubeGeometry(30,5,8);
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
            scene.add(object);
        })
    });
}
function timeUp() {
    if(!alert('time is up, click ok to try again.')) {
        window.location.reload();
    }
}

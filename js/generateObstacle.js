var ballMaterial = new THREE.MeshLambertMaterial({
    color:0x0000ff
});
var ballGeometry = new THREE.SphereGeometry(3,8,6);
var cubeMaterial = new THREE.MeshLambertMaterial({
    color:0xff0000
});
var cubeGeometry = new THREE.CubeGeometry(4,4,4);
function generateObstacle() {
    for(i=0;i<=16;i++){
        switch (Math.round(Math.random())){
            case 0:
                createBall();
                break;
            case 1:
                createCube();
                break;
        }
    }
}
function collisionResult(object, linearVelocity, angularVelocity) {
    if (this.collisioned || object.name != 'transparentBox'){
        return null;
    }
    else if(this.name=='ball'){
        scene.remove(this);
        score += 2;
        scoreElement.innerHTML = score;
    }
    else if(this.name=='cube'){
        scene.remove(this);
        score -= 1;
        scoreElement.innerHTML = score;
    }
}
function createBall(){
    ballMesh = new Physijs.SphereMesh(ballGeometry,ballMaterial,0.001);
    ballMesh.position.set(-((i+Math.random())*100),4,(Math.random()-0.5)*70);
    ballMesh.name = 'ball';
    ballMesh.addEventListener('collision',collisionResult);
    scene.add(ballMesh);
}
function createCube() {
    cubeMesh = new Physijs.BoxMesh(cubeGeometry,cubeMaterial,0.001);
    cubeMesh.position.set(-((i+Math.random())*100),5,(Math.random()-0.5)*70);
    cubeMesh.name = 'cube';
    cubeMesh.addEventListener('collision',collisionResult);
    scene.add(cubeMesh);
}

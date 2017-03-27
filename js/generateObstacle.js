function generateObstacle() {
    var ballMaterial = new THREE.MeshLambertMaterial({
        color:0x0000ff
    });
    var ballGeometry = new THREE.SphereGeometry(3,8,6);
    ballMesh = new Physijs.SphereMesh(ballGeometry,ballMaterial,0.1);
    ballMesh.position.set(10,4,10);
    ballMesh.addEventListener('collision',collisionResult);
    function collisionResult(object, linearVelocity, angularVelocity) {
        if (this.collisioned || object.name != 'transparentBox'){
            return null;
        }
        else {
            scene.remove(ballMesh);
            score += 1;
            scoreElement.innerHTML = score;
        }
    }
    scene.add(ballMesh);
}


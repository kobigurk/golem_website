$(document).ready(function () {
    var canvas = document.querySelector('#canvas'),
        context = canvas.getContext('2d');
    context.canvas.width = $("#canvas-container").width();
    context.canvas.height = $("#canvas-container").height();


    var center = {
        x: context.canvas.width / 2,
        y: context.canvas.height / 2
    };

    var mousePos = {
        x: 0,
        y: 0
    };

    var vector = {
        x: center.x - mousePos.x,
        y: center.y - mousePos.y
    }

    var p1 = {
        x: center.x + vector.x * Math.cos(getRadians(9)),
        y: center.y + vector.y * Math.sin(getRadians(9))
    }

    var p2 = {
        x: center.x + vector.x * Math.sin(getRadians(9)),
        y: center.y + vector.y * Math.cos(getRadians(9))
    }

    var beamCenter = {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2
    }

    var perpVector = {
        x: (-(p2.y - p1.y)) / 2,
        y: (p2.x - p1.x) / 2
    }

    var p3 = {
        x: beamCenter.x + perpVector.x,
        y: beamCenter.y + perpVector.y,
    }

    var p4 = {
        x: beamCenter.x - perpVector.x,
        y: beamCenter.y - perpVector.y,
    }



    context.beginPath();
    context.moveTo(mousePos.x, mousePos.y);
    context.lineTo(center.x, center.y);
    context.stroke();

    context.beginPath();
    context.moveTo(mousePos.x, mousePos.y);
    context.lineTo(p1.x, p1.y);
    context.lineTo(p2.x, p2.y);
    context.fillStyle = "rgba(255, 255, 255, 0.7)";
    context.fill();


    canvas.onmousemove = function (e) {
        mousePos = windowToCanvas(canvas, e.clientX, e.clientY);

        vector = {
            x: center.x - mousePos.x,
            y: center.y - mousePos.y
        }

        p1 = {
            x: center.x + vector.x * Math.cos(getRadians(9)),
            y: center.y + vector.y * Math.sin(getRadians(9))
        }

        p2 = {
            x: center.x + vector.x * Math.sin(getRadians(9)),
            y: center.y + vector.y * Math.cos(getRadians(9))
        }

        beamCenter = {
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2
        }

        perpVector = {
            x: (-(p2.y - p1.y)) / 2,
            y: (p2.x - p1.x) / 2
        }

        p3 = {
            x: beamCenter.x + perpVector.x,
            y: beamCenter.y + perpVector.y,
        }

        p4 = {
            x: beamCenter.x - perpVector.x,
            y: beamCenter.y - perpVector.y,
        }

        //Calculate Tangents
        var pointDistance = {
            x: beamCenter.x - mousePos.x,
            y: beamCenter.y - mousePos.y,
            length: function () {
                return Math.sqrt(this.x * this.x + this.y * this.y)
            }
        }

        var radius = getDist(p1.x, p1.y, p2.x, p2.y) / 2;
        //Alpha
        var a = Math.asin(radius / pointDistance.length());
        //Beta
        var b = Math.atan2(pointDistance.y, pointDistance.x);
        //Tangent angle
        var t = b - a;
        //Tangent points
        var T1 = {
            x: beamCenter.x + radius * Math.sin(t),
            y: beamCenter.y + radius * -Math.cos(t)
        };

        t = b + a;
        var T2 = {
            x: beamCenter.x + radius * -Math.sin(t),
            y: beamCenter.y + radius * Math.cos(t)
        }


        eraseBackground();
        context.beginPath();
        context.moveTo(mousePos.x, mousePos.y);
        context.lineTo(center.x, center.y);
        context.stroke();

        context.beginPath();
        context.moveTo(mousePos.x, mousePos.y);
        context.lineTo(T1.x, T1.y);
        context.lineTo(T2.x, T2.y);
        context.fillStyle = "rgba(255, 255, 255, 0.7)";
        context.fill();

        /* Not needed anymore.
         context.moveTo(mousePos.x, mousePos.y);
         context.lineTo(p3.x, p3.y);
         context.lineTo(p4.x, p4.y);
         context.fillStyle = "rgba(255, 255, 255, 0.7)";
         context.fill();
         */

        context.beginPath();
        context.arc(beamCenter.x, beamCenter.y, getDist(p1.x, p1.y, p2.x, p2.y) / 2, 0, 2 * Math.PI, false);
        context.fillStyle = "rgba(255, 255, 255, 0.7)";
        context.fill();

    }

    // ------------------------------------------------
    // utilitits
    // ------------------------------------------------
    function map(value, inputMin, inputMax, outputMin, outputMax, clamp) {
        var outVal = ((value - inputMin) / (inputMax - inputMin) * (outputMax - outputMin) + outputMin);
        if (clamp) {
            if (outputMax < outputMin) {
                if (outVal < outputMax) outVal = outputMax;
                else if (outVal > outputMin) outVal = outputMin;
            } else {
                if (outVal > outputMax) outVal = outputMax;
                else if (outVal < outputMin) outVal = outputMin;
            }
        }
        return outVal;
    }

    function getDist(x1, y1, x2, y2) {
        return Math.round(Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)));
    }

    function getHypotenuse(x, y) {
        return Math.sqrt(x * x + y * y);
    }

    function getRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    function clamp(value, min, max) {
        return value < min ? min : value > max ? max : value;
    }

    function windowToCanvas(canvas, x, y) {
        var bbox = canvas.getBoundingClientRect();
        return {
            x: x - bbox.left * (canvas.width / bbox.width),
            y: y - bbox.top * (canvas.height / bbox.height)
        };
    }

    function eraseBackground() {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

});






document.getElementById('newWindow').href += window.location.hash;

var gui = new dat.GUI();
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 50 );
camera.position.z = 30;

var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var orbit = new THREE.OrbitControls( camera, renderer.domElement );
orbit.enableZoom = false;

var ambientLight = new THREE.AmbientLight( 0x000000 );
scene.add( ambientLight );

var lights = [];
lights[0] = new THREE.PointLight( 0xffffff, 1, 0 );
lights[1] = new THREE.PointLight( 0xffffff, 1, 0 );
lights[2] = new THREE.PointLight( 0xffffff, 1, 0 );

lights[0].position.set( 0, 200, 0 );
lights[1].position.set( 100, 200, 100 );
lights[2].position.set( -100, -200, -100 );

scene.add( lights[0] );
scene.add( lights[1] );
scene.add( lights[2] );

var mesh = new THREE.Object3D()

mesh.add( new THREE.LineSegments(

    new THREE.Geometry(),

    new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5
    })

));

mesh.add( new THREE.Mesh(

    new THREE.Geometry(),

    new THREE.MeshPhongMaterial({
        color: 0x156289,
        emissive: 0x072534,
        side: THREE.DoubleSide,
        shading: THREE.FlatShading
    })

));

var options = chooseFromHash( mesh );

scene.add( mesh );

var prevFog = false;

var render = function () {

    requestAnimationFrame( render );

    var time = Date.now() * 0.001;

    if( !options.fixed ) {
        mesh.rotation.x += 0.005;
        mesh.rotation.y += 0.005;
    }

    renderer.render( scene, camera );

};

window.addEventListener( 'resize', function () {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}, false );

render();




document.getElementById('newWindow').href += window.location.hash;

var gui = new dat.GUI();
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 50 );
camera.position.z = 30;

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var ambientLight = new THREE.AmbientLight( 0x000000 );
scene.add( ambientLight );

var lights = [];
lights[0] = new THREE.PointLight( 0xffffff, 1, 0 );
lights[1] = new THREE.PointLight( 0xffffff, 1, 0 );
lights[2] = new THREE.PointLight( 0xffffff, 1, 0 );

lights[0].position.set( 0, 200, 0 );
lights[1].position.set( 100, 200, 100 );
lights[2].position.set( -100, -200, -100 );

scene.add( lights[0] );
scene.add( lights[1] );
scene.add( lights[2] );

guiScene( gui, scene, camera );

var geometry = new THREE.TorusKnotGeometry( 10, 3, 100, 16 );
var mesh = new THREE.Mesh( geometry );

generateVertexColors( geometry );

mesh.material = chooseFromHash( gui, mesh, geometry );

generateMorphTargets( mesh, geometry );

scene.add( mesh );

var prevFog = false;

var render = function () {

    requestAnimationFrame( render );

    var time = Date.now() * 0.001;

    mesh.rotation.x += 0.005;
    mesh.rotation.y += 0.005;

    if ( prevFog !== scene.fog ) {

        mesh.material.needsUpdate = true;
        prevFog = scene.fog;

    }

    if ( mesh.morphTargetInfluences ) {

        mesh.morphTargetInfluences[ 0 ] = ( 1 + Math.sin( 4 * time ) ) / 2;

    }

    renderer.render( scene, camera );

};

window.addEventListener( 'resize', function () {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}, false );

render();

/////////
var canvas;
var stage;
var tweens;
var activeCount;
var circleCount = 25;
var text;

function init() {
    canvas = document.getElementById("testCanvas");
    stage = new createjs.Stage(canvas);
    stage.enableDOMEvents(true);
    tweens = [];
    stage.enableMouseOver(10);
    createjs.Touch.enable(stage);

    for (var i = 0; i < circleCount; i++) {
        // draw the circle, and put it on stage:
        var circle = new createjs.Shape();
        circle.graphics.setStrokeStyle(15);
        circle.graphics.beginStroke("#113355");
        circle.graphics.drawCircle(0, 0, (i + 1) * 4);
        circle.alpha = 1 - i * 0.02;
        circle.x = Math.random() * 550;
        circle.y = Math.random() * 400;
        circle.compositeOperation = "lighter";

        var tween = createjs.Tween.get(circle).to({x: 275, y: 200}, (0.5 + i * 0.04) * 1500, createjs.Ease.bounceOut).call(tweenComplete);
        tweens.push({tween: tween, ref: circle});
        stage.addChild(circle);
    }
    activeCount = circleCount;
    stage.addEventListener("stagemouseup", handleMouseUp);

    text = new createjs.Text("Click Anywhere to Tween", "36px Arial", "#777");
    text.x = 350;
    text.y = 200;
    stage.addChild(text);

    createjs.Ticker.addEventListener("tick", tick);
}

function handleMouseUp(event) {
    if (text) {
        stage.removeChild(text);
        text = null;
    }
    for (var i = 0; i < circleCount; i++) {
        var ref = tweens[i].ref;
        var tween = tweens[i].tween;
        createjs.Tween.get(ref, {override: true}).to({x: stage.mouseX, y: stage.mouseY}, (0.5 + i * 0.04) * 1500, createjs.Ease.bounceOut).call(tweenComplete);
    }
    activeCount = circleCount;
}

function tweenComplete() {
    activeCount--;
}

function tick(event) {
    if (activeCount) {
        stage.update(event);
    }
}



//$.merge(circle, lines)
//$.each(lines, function() {
//    //console.log(this);
//    //if($.inArray(this.parents[0].start, ids) === -1) {
//    //    ids.push(this.parents[0].start);
//    //}
//    var line = this,
//        tweens = $.grep(self.tweens, function (e) {
//            return e.ref.id === line.id;
//        });
//
//    $.each(tweens, function(i) {
//        console.log(this.ref);
//        this.ref.graphics
//            .setStrokeStyle(1)
//            .beginStroke(self.colorLight)
//            .moveTo(0, 0)
//            .lineTo(100, 0);
//
//        createjs.Tween.get(this.ref, {override: true}).to({x: 0, y: 0}, (0.5 + i * 0.04) * 1500, createjs.Ease.linear).call(self.tweenComplete);
//    });
//});
//console.log(ids);
"use strict";
import * as THREE from 'https://unpkg.com/three@0.123.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.123.0/examples/jsm/controls/OrbitControls.js';

var renderer;
var scene;
var camera;
var camera1;
var camera2;
var camera3;
var camera2Helper;
const farTile = 35;

var dollyPosition = -25;

var blackKing;

var cameraObj;

var options;

var orbitControls;
var eyeTargetScale;

function init() {
	scene = new THREE.Scene();
	camera1 = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
	camera1.position.set(-100, 40, 60);
	camera1.lookAt(scene.position);

	camera2 = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 150);
	camera2Helper = new THREE.CameraHelper(camera2);
	scene.add(camera2Helper);

	camera3 = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
	camera3.position.set(4.6, 35, 0);

	cameraObj = createCamera();
	cameraObj.position.set(camera3.position.x, camera3.position.y, camera3.position.z);
	scene.add(cameraObj);

	renderer = new THREE.WebGLRenderer({ antialias: true });
	// renderer.setClearColor(0x550022, 0.5);
	renderer.setClearColor(0x222222, 0.5);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	var spotLight = new THREE.SpotLight({ intensity: 2 });
	spotLight.position.set(0, 40, -80);
	spotLight.shadow.mapSize.width = 4096; // default is 512
	spotLight.shadow.mapSize.height = 4096; // default is 512
	spotLight.angle = Math.PI / 3.5;
	spotLight.castShadow = true;

	scene.add(spotLight);

	// const spotLightHelper = new THREE.SpotLightHelper(spotLight);
	// scene.add(spotLightHelper);

	// const axesHelper = new THREE.AxesHelper(20);
	// scene.add(axesHelper);

	const ambientLight = new THREE.AmbientLight(0x404040, 2); // soft white light
	scene.add(ambientLight);

	document.body.appendChild(renderer.domElement);

	var controls = new function() {
		this.fieldOfView = 45;
		this.cameraNo = 1;
		this.dolyZoom = 0;
		this.dollyWireframe = false;

		this.asGeom = function() {
			options = {
				fieldOfView: controls.fieldOfView,
				cameraNo: controls.cameraNo,
				dolyZoom: controls.dolyZoom,
				dollyWireframe: controls.dollyWireframe
			};

			camera1.fov = options.fieldOfView;
			camera1.updateProjectionMatrix();
			changeCamera(options.cameraNo);
			zoomInDoly(options.dolyZoom - 73);
			camera2Helper.visible = options.dollyWireframe;
		};
	}

	var gui = new dat.GUI();
	gui.add(controls, 'fieldOfView', 2, 80).step(1).onChange(controls.asGeom);
	gui.add(controls, 'cameraNo', 1, 3).step(1).onChange(controls.asGeom);
	gui.add(controls, 'dolyZoom', -100, 100).step(0.01).onChange(controls.asGeom);
	gui.add(controls, 'dollyWireframe', false, true).onChange(controls.asGeom);
	addFloor();

	const whiteKing = createKing(0xE7D2B3);
	whiteKing.position.x = 4.6;
	whiteKing.position.z = farTile;
	whiteKing.name = "whiteKing";

	blackKing = createKing(0x212121);
	blackKing.position.x = -5.5;
	blackKing.position.z = -4.5;
	blackKing.name = "blackKing";

	camera2.position.x = dollyPosition;
	camera2.position.z = dollyPosition;
	camera2.position.y = 13;
	target = new THREE.Vector3();
	target.set(blackKing.position.x, blackKing.position.y + 10, blackKing.position.z)
	camera2.lookAt(target);
	camera2.updateMatrixWorld();

	camera2.far = target;

	let startdir = new THREE.Vector3();
	startdir.subVectors(camera2.position, target);
	eyeTargetScale = Math.tan(camera2.fov * (Math.PI / 180) / 2) * startdir.length();

	scene.add(whiteKing);
	scene.add(blackKing);

	orbitControls = new OrbitControls(camera1, renderer.domElement);

	// drawRectangle();

	controls.asGeom();
	render();
}

// function drawRectangle() {
// 	const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
// 	const points = [];
// 	points.push(new THREE.Vector3(-100, 200, 0));
// 	points.push(new THREE.Vector3(0, 10, 0));
// 	points.push(new THREE.Vector3(100, -200, 0));

// 	const geometry = new THREE.BufferGeometry().setFromPoints(points);
// 	const line = new THREE.Line(geometry, material);
// 	scene.add(line);
// }

let eyedir;
let target;

function zoomInDoly(level) {

	camera2.position.x = dollyPosition - dollyPosition * level / 50;
	camera2.position.z = dollyPosition - dollyPosition * level / 50;

	target = new THREE.Vector3();
	target.set(blackKing.position.x, blackKing.position.y + 10, blackKing.position.z)

	eyedir = new THREE.Vector3();
	eyedir.subVectors(camera2.position, target);

	camera2.near = eyedir.length() / 100;
	camera2.far = eyedir.length() + 100;
	camera2.fov = (180 / Math.PI) * 2 * Math.atan(eyeTargetScale / eyedir.length());
	camera2.lookAt(target);

	camera2.updateProjectionMatrix();
	camera2.updateMatrixWorld();
	camera2Helper.update();
}

function changeCamera(cameraNo) {
	switch (cameraNo) {
		case 1:
			camera = camera1;
			break;
		case 2:
			camera = camera2;
			break;
		case 3:
			camera = camera3;
			break;
		default:
			camera = camera1;
			break;
	}
}

function createCamera() {
	const body = new THREE.Mesh(new THREE.BoxGeometry(8, 4.5, 2.5), new THREE.MeshPhongMaterial({ color: 0x333333, shininess: 100 }));
	const rearBox = new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, 1), new THREE.MeshPhongMaterial({ color: 0x555555, shininess: 100 }));
	rearBox.position.x -= 4;

	const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 0.8, 2, 100), new THREE.MeshPhongMaterial({ color: 0x555555, shininess: 100 }));
	cylinder.position.x += 5;
	cylinder.rotation.z = -Math.PI / 2

	const innerCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.1, 2.5, 100), new THREE.MeshPhongMaterial({ color: 0xaa0000, shininess: 100 }));
	innerCylinder.position.x += 5;
	innerCylinder.rotation.z = -Math.PI / 2

	const topCylinder1 = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 2, 100), new THREE.MeshPhongMaterial({ color: 0x555555, shininess: 100 }));
	topCylinder1.rotation.x = -Math.PI / 2
	topCylinder1.position.set(-2.5, 4.5, 0);

	const topCylinder2 = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 2, 100), new THREE.MeshPhongMaterial({ color: 0x555555, shininess: 100 }));
	topCylinder2.rotation.x = -Math.PI / 2
	topCylinder2.position.set(2.5, 4.5, 0);

	const cameraShapesGroup = new THREE.Group();
	cameraShapesGroup.add(body);
	cameraShapesGroup.add(rearBox);
	cameraShapesGroup.add(cylinder);
	cameraShapesGroup.add(innerCylinder);
	cameraShapesGroup.add(topCylinder1);
	cameraShapesGroup.add(topCylinder2);
	cameraShapesGroup.rotation.y = -Math.PI / 2;
	cameraShapesGroup.position.z = -4;

	const orientedGroup = new THREE.Group();
	orientedGroup.add(cameraShapesGroup);

	// const axesHelper = new THREE.AxesHelper(3);
	// orientedGroup.add(axesHelper);

	return orientedGroup;
}

const height = 10;

function createKing(color) {
	var pointsX = [
		250, 240, 228,
		217, 208, 206,
		207, 211, 215, 220, 225,
		221, 219,
		218, 216,
		214, 213, 213, 215,
		219, 222,
		224,
		227, 229,
		229, 229, 229,
		229, 228, 226, 223,
		218, 212, 205,
		196, 191, 191,
		177, 169, 168, 175,
		180, 180,
		169,
		167
	];
	var pointsY = [
		26, 28, 31,
		35, 40, 44,
		53, 65, 75, 84, 92,
		96, 100,
		104, 105,
		107, 109, 111, 113,
		114, 115,
		118,
		121, 123,
		155, 171, 186,
		202, 214, 226, 238,
		250, 262, 274,
		286, 292, 298,
		310, 322, 334, 346,
		347, 351,
		351,
		360
	];
	var points = [];
	var count = pointsX.length;
	for (var i = 0; i < count; i++) {
		points.push(new THREE.Vector3(25 - pointsX[i] / 10, pointsY[i] / -height, (pointsY[30] - pointsY[i] - 174) / 10));
	}

	// var spGroup = new THREE.Object3D();
	// var material = new THREE.MeshBasicMaterial({
	// 	color: 0xff0000,
	// 	transparent: false
	// });
	// points.forEach(function(point) {

	// 	var spGeom = new THREE.SphereGeometry(0.2);
	// 	var spMesh = new THREE.Mesh(spGeom, material);
	// 	spMesh.position.set(point.x, point.y, point.z);
	// 	spGroup.add(spMesh);
	// });

	// spGroup.rotation.x = -Math.PI / 5;
	// spGroup.position.y = 25;

	// scene.add(spGroup);

	var latheGeometry = new THREE.LatheGeometry(points, 100, 0, 2 * Math.PI);

	var meshMaterial = new THREE.MeshStandardMaterial();

	// const r = "https://threejs.org/examples/textures/cube/Bridge2/";
	const r = "./textures/map/";
	const urls = [
		r + "posx.jpg", r + "negx.jpg",
		r + "posy.jpg", r + "negy.jpg",
		r + "posz.jpg", r + "negz.jpg"
	];

	const chromeMap = new THREE.CubeTextureLoader().load(urls);

	meshMaterial.color = new THREE.Color(color);
	meshMaterial.metalness = 0.4;
	meshMaterial.roughness = 0.15;
	// meshMaterial.emissive = 0x000000;

	meshMaterial.envMap = chromeMap;

	meshMaterial.side = THREE.DoubleSide;
	var latheMesh = new THREE.Mesh(latheGeometry, meshMaterial);
	latheMesh.castShadow = true;
	// latheMesh.receiveShadow = true;

	const s = 0.38;
	latheMesh.scale.set(s, s, s);

	const crossGroup = new THREE.Group();

	const baseCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.3, 1.3, 100), meshMaterial);
	baseCylinder.position.y = 0.3;

	const rightCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.15, 1, 100), meshMaterial);
	rightCylinder.rotation.z = Math.PI / 2;
	rightCylinder.position.set(-0.5, 0.8, 0);

	const leftCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.3, 1, 100), meshMaterial);
	leftCylinder.rotation.z = Math.PI / 2;
	leftCylinder.position.set(0.5, 0.8, 0);

	const topCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.15, 1, 100), meshMaterial);
	topCylinder.position.set(0, 1.3, 0);

	const middleSphere = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 32), meshMaterial);
	middleSphere.position.y = 0.8;

	const baseSphere = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), meshMaterial);
	baseSphere.position.y = -0.5;

	crossGroup.add(baseCylinder);
	crossGroup.add(rightCylinder);
	crossGroup.add(topCylinder);
	crossGroup.add(leftCylinder);
	crossGroup.add(middleSphere);
	crossGroup.add(baseSphere);

	crossGroup.position.y = 13;
	crossGroup.children.forEach(child => {
		child.castShadow = true;
	});

	const group = new THREE.Group();

	latheMesh.position.y = 13.7;
	latheMesh.updateMatrixWorld();

	group.add(crossGroup);
	group.add(latheMesh);
	return group;
}

function addFloor() {
	var floorGeometry = new THREE.PlaneGeometry(100, 100, 20, 20);
	var floorMaterial = new THREE.MeshPhongMaterial({ shininess: 40 });
	floorMaterial.map = new THREE.TextureLoader().load("./textures/table.png");
	floorMaterial.side = THREE.DoubleSide;

	var floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
	floorMesh.rotation.x = -0.5 * Math.PI;
	floorMesh.receiveShadow = true;
	scene.add(floorMesh);
}

let step = 0;
let b = 0;
let tile = 0;
let dir = 1;

let rotation;
const delta = 35;
let diff;

function render() {
	renderer.render(scene, camera);
	if (camera == camera1) {
		orbitControls.update();
		if (options.dollyWireframe) {
			camera2Helper.visible = true;
		}
	} else camera2Helper.visible = false;

	var whiteKing = scene.getObjectByName('whiteKing');

	// //whole board movement
	step += 0.015;
	whiteKing.position.z = 35 * Math.cos(step);
	// //whole board movement

	// //tile by tile movement
	// step += 0.03;
	// let a = Math.sin(step);
	// if (a < 0) {
	// 	b += dir * a;
	// 	whiteKing.position.z = farTile + b / 6.8;
	// } else {
	// 	tile++;
	// 	if (tile == 8) {
	// 		dir *= -1;
	// 		tile = 1;
	// 	}
	// 	step = Math.PI;
	// }
	// //tile by tile movement

	camera3.lookAt(whiteKing.position);
	cameraObj.lookAt(whiteKing.position);

	// //z rotation start
	if (Math.abs(whiteKing.position.z) - delta < camera3.position.z) {
		diff = Math.sin((-Math.PI / (2 * delta)) * whiteKing.position.z);
		rotation = diff * Math.PI / 2 - Math.PI / 2
		camera3.rotation.z = rotation;
		cameraObj.rotation.z = rotation + Math.PI;
	}
	// //z rotation end

	//x position start
	// if (Math.abs(whiteKing.position.z) - delta < camera3.position.z) {
	// 	diff = Math.cos((-Math.PI / (2 * delta)) * whiteKing.position.z);
	// 	camera3.position.x = 4.6 + 4 * diff;
	// 	cameraObj.position.x = 4.6 + 4 * diff;
	// }
	//x position end

	requestAnimationFrame(render);
}

window.onload = init;
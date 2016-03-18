/// <reference path="_reference.ts"/>

// MAIN GAME FILE

// THREEJS Aliases
import Scene = Physijs.Scene;
import Renderer = THREE.WebGLRenderer;
import PerspectiveCamera = THREE.PerspectiveCamera;
import BoxGeometry = THREE.BoxGeometry;
import CubeGeometry = THREE.CubeGeometry;
import PlaneGeometry = THREE.PlaneGeometry;
import SphereGeometry = THREE.SphereGeometry;
import Geometry = THREE.Geometry;
import AxisHelper = THREE.AxisHelper;
import LambertMaterial = THREE.MeshLambertMaterial;
import MeshBasicMaterial = THREE.MeshBasicMaterial;
import LineBasicMaterial = THREE.LineBasicMaterial;
import PhongMaterial = THREE.MeshPhongMaterial;
import Texture = THREE.Texture;
import Material = THREE.Material;
import Mesh = THREE.Mesh;
import Line = THREE.Line;
import Object3D = THREE.Object3D;
import SpotLight = THREE.SpotLight;
import PointLight = THREE.PointLight;
import AmbientLight = THREE.AmbientLight;
import Control = objects.Control;
import GUI = dat.GUI;
import Color = THREE.Color;
import Vector3 = THREE.Vector3;
import Face3 = THREE.Face3;
import Point = objects.Point;
import CScreen = config.Screen;
import Clock = THREE.Clock;

//Custom Game Objects
import gameObject = objects.gameObject;

// Setup a Web Worker for Physijs
Physijs.scripts.worker = "/Scripts/lib/Physijs/physijs_worker.js";
Physijs.scripts.ammo = "/Scripts/lib/Physijs/examples/js/ammo.js";


// setup an IIFE structure (Immediately Invoked Function Expression)
var game = (() => {

    // declare game objects
    var havePointerLock: boolean;
    var element: any;
    var scene: Scene = new Scene(); // Instantiate Scene Object
    var renderer: Renderer;
    var camera: PerspectiveCamera;
    var control: Control;
    var gui: GUI;
    var stats: Stats;
    var blocker: HTMLElement;
    var instructions: HTMLElement;
    var spotLights: SpotLight[];
    var pointLights: PointLight[];
    var groundTexture: Texture;
    var groundTextureNormal: Texture;
    var groundGeometry: CubeGeometry;
    var groundMaterial: Physijs.Material;
    var ground: Physijs.Mesh;
    var ceilingGeometry: CubeGeometry;
    var ceilingMaterial: Physijs.Material;
    var ceiling: Physijs.Mesh;
    var clock: Clock;
    var playerGeometry: CubeGeometry;
    var playerMaterial: Physijs.Material;
    var player: Physijs.Mesh;
    var sphereGeometry: SphereGeometry;
    var sphereMaterial: Physijs.Material;
    var sphere: Physijs.Mesh;
    var keyboardControls: objects.KeyboardControls;
    var mouseControls: objects.MouseControls;
    var isGrounded: boolean = false;
    var velocity: Vector3 = new Vector3(0, 0, 0);
    var prevTime: number = 0;
    var directionLineMaterial: LineBasicMaterial;
    var directionLineGeometry: Geometry;
    var directionLine: Line;
    var wallMaterial: Physijs.Material;
    var walls: Physijs.Mesh[];
    var axes: AxisHelper;
    
    function init() {
        // Create to HTMLElements
        blocker = document.getElementById("blocker");
        instructions = document.getElementById("instructions");
        
        //check to see if pointerlock is supported
        havePointerLock = 'pointerLockElement' in document ||
            'mozPointerLockElement' in document ||
            'webkitPointerLockElement' in document;

        // setup keyboard and mouse controls
        keyboardControls = new objects.KeyboardControls();
        mouseControls = new objects.MouseControls();
                
        if (havePointerLock) {            
            element = document.body;

            instructions.addEventListener('click', () => {
                
                // Ask the user for pointer lock
                console.log("Requesting PointerLock");

                element.requestPointerLock = element.requestPointerLock ||
                    element.mozRequestPointerLock ||
                    element.webkitRequestPointerLock;

                element.requestPointerLock();
            });

            document.addEventListener('pointerlockchange', pointerLockChange);
            document.addEventListener('mozpointerlockchange', pointerLockChange);
            document.addEventListener('webkitpointerlockchange', pointerLockChange);
            document.addEventListener('pointerlockerror', pointerLockError);
            document.addEventListener('mozpointerlockerror', pointerLockError);
            document.addEventListener('webkitpointerlockerror', pointerLockError);
        }

        // Scene changes for Physijs
        scene.name = "Main";
        scene.fog = new THREE.Fog(0xffffff, 0 , 750);
        scene.setGravity(new THREE.Vector3(0, -20, 0));
        
        scene.addEventListener('update', () => {
           scene.simulate(undefined, 2); 
        });
        
        // setup a THREE.JS Clock object
        clock = new Clock();
        
        setupRenderer(); // setup the default renderer
	
        setupCamera(); // setup the camera

        // Add an axis helper to the scene
        // axes = new AxisHelper(30);
        // axes.position.set(0, 5, 0);
        // scene.add(axes);
        // console.log("Added Axis Helper to scene...");

        // Spot Light
        // spotLights = new Array<SpotLight>();
        // spotLights.push(new SpotLight(0xffffff, 1, 75));
        // spotLights.push(new SpotLight(0xffffff, 1, 75));
        // spotLights.push(new SpotLight(0xffffff, 1, 75));
        // spotLights.push(new SpotLight(0xffffff, 1, 75));

        // spotLights[0].position.set(28, 20, 28);
        // spotLights[1].position.set(-28, 20, 28);
        // spotLights[2].position.set(28, 20, -28);
        // spotLights[3].position.set(-28, 20, -28);

        // for (var i = 0; i < spotLights.length; i++) {
        //     spotLights[i].castShadow = true;
        //     spotLights[i].lookAt(new Vector3(0, 0, 0));
        //     spotLights[i].shadowCameraNear = 2;
        //     spotLights[i].shadowCameraFar = 200;
        //     spotLights[i].shadowCameraLeft = -5;
        //     spotLights[i].shadowCameraRight = 5;
        //     spotLights[i].shadowCameraTop = 5;
        //     spotLights[i].shadowCameraBottom = -5;
        //     spotLights[i].shadowMapWidth = 2048;
        //     spotLights[i].shadowMapHeight = 2048;
        //     spotLights[i].shadowDarkness = 0.5;
        //     spotLights[i].name = "Spot Light";
        //     scene.add(spotLights[i]);
        //     console.log("Added Spot Lights to scene");  
        // }
        
        // Point Lights
        pointLights = new Array<PointLight>();
        pointLights.push(new PointLight(0xffffff, 1, 55));
        pointLights.push(new PointLight(0xffffff, 1, 55));
        pointLights.push(new PointLight(0xffffff, 1, 55));
        pointLights.push(new PointLight(0xffffff, 1, 55));
        pointLights[0].position.set(28, 20, 28);
        pointLights[1].position.set(-28, 20, 28);
        pointLights[2].position.set(28, 20, -28);
        pointLights[3].position.set(-28, 20, -28);
        
        for (var i = 0; i < pointLights.length; i++) {
            pointLights[i].name = "Point Light " + i;
            scene.add(pointLights[i]);
            console.log("Added Point Lights to scene");
        }
        
        // Ground
        groundGeometry = new BoxGeometry(64, 1, 64);
        groundMaterial = Physijs.createMaterial(new PhongMaterial({ map: THREE.ImageUtils.loadTexture('../../Assets/Images/gravel.jpg'), side: THREE.DoubleSide }), 0, 0);
        ground = new Physijs.ConvexMesh(groundGeometry, groundMaterial, 0);
        ground.receiveShadow = true;
        ground.name = "Ground";
        scene.add(ground);
        console.log("Added Ground to scene");
        
        // Ceiling
        ceilingGeometry = new BoxGeometry(64, 1, 64);
        ceilingMaterial = Physijs.createMaterial(new LambertMaterial({ map: THREE.ImageUtils.loadTexture('../../Assets/Images/ceiling.jpg'), side: THREE.DoubleSide }), 0, 0);
        ceiling = new Physijs.ConvexMesh(ceilingGeometry, ceilingMaterial, 0);
        ceiling.position.set(0, 24, 0);
        ceiling.receiveShadow = true;
        ceiling.name = "Ceiling";
        scene.add(ceiling);
        console.log("Added Ceiling to scene");
        
        // Walls
        walls = new Array<Physijs.BoxMesh>();
        wallMaterial = Physijs.createMaterial(new LambertMaterial({ map: THREE.ImageUtils.loadTexture('../../Assets/Images/brick.jpeg'), side: THREE.DoubleSide }), 0, 0);
        
        // Outer walls
        walls.push(new Physijs.BoxMesh(new BoxGeometry(2, 24, 64), wallMaterial, 0));
        walls.push(new Physijs.BoxMesh(new BoxGeometry(2, 24, 64), wallMaterial, 0));
        walls.push(new Physijs.BoxMesh(new BoxGeometry(64, 24, 2), wallMaterial, 0));
        walls.push(new Physijs.BoxMesh(new BoxGeometry(64, 24, 2), wallMaterial, 0));
        
        walls[0].position.set(-32, 12, 0);
        walls[1].position.set(32, 12, 0);
        walls[2].position.set(0, 12, 32);
        walls[3].position.set(0, 12, -32);
        
        // Inner walls
        walls.push(new Physijs.BoxMesh(new BoxGeometry(50, 24, 2), wallMaterial, 0));
        walls.push(new Physijs.BoxMesh(new BoxGeometry(2, 24, 40), wallMaterial, 0));
        walls.push(new Physijs.BoxMesh(new BoxGeometry(32, 24, 2), wallMaterial, 0));
        walls.push(new Physijs.BoxMesh(new BoxGeometry(44, 24, 2), wallMaterial, 0));
        walls.push(new Physijs.BoxMesh(new BoxGeometry(2, 24, 22), wallMaterial, 0));
        walls.push(new Physijs.BoxMesh(new BoxGeometry(2, 24, 22), wallMaterial, 0));
        walls.push(new Physijs.BoxMesh(new BoxGeometry(2, 24, 10), wallMaterial, 0));
        walls.push(new Physijs.BoxMesh(new BoxGeometry(2, 24, 10), wallMaterial, 0));
        walls.push(new Physijs.BoxMesh(new BoxGeometry(10, 24, 2), wallMaterial, 0));
        walls.push(new Physijs.BoxMesh(new BoxGeometry(2, 24, 10), wallMaterial, 0));
        walls.push(new Physijs.BoxMesh(new BoxGeometry(2, 24, 10), wallMaterial, 0));

        walls[4].position.set(6, 12, -20);
        walls[5].position.set(20, 12, 0);
        walls[6].position.set(4, 12, 19);
        walls[7].position.set(-11, 12, 0);
        walls[8].position.set(0, 12, 0);
        walls[9].position.set(-22, 12, 20);
        walls[10].position.set(-11, 12, 14);
        walls[11].position.set(10, 12, 14);
        walls[12].position.set(14, 12, -10);
        walls[13].position.set(-11, 12, -14);
        walls[14].position.set(-22, 12, -6);

        
        for (var i = 0; i < walls.length; i++) {
            walls[i].receiveShadow = true;
            walls[i].name = "Wall " + i;
            scene.add(walls[i]);
            console.log("Added Wall " + i + " to scene");
        }
        
 
        // Player Object
        playerGeometry = new BoxGeometry(2, 2, 2);
        playerMaterial = Physijs.createMaterial(new LambertMaterial({color: 0x00ff00}), 0, 0);
        player = new Physijs.BoxMesh(playerGeometry, playerMaterial, 1);
        player.position.set(26, 2, -16);
        player.rotation.y = Math.PI;
        player.receiveShadow = true;
        player.castShadow = true;
        player.name = "Player";
        scene.add(player);
        console.log("Added Player to Scene");
        
        player.addEventListener('collision', function(e) {
           if(e.name === "Ground") {
               console.log("Player hit the ground");
               isGrounded = true;
           }
           if(e.name === "Sphere") {
               console.log("Player hit the sphere");
           }
        });
        
        // Add Direction Line
        directionLineMaterial = new LineBasicMaterial({color:0xffff00});
        directionLineGeometry = new Geometry();
        directionLineGeometry.vertices.push(new Vector3(0, 0, 0)); // line origin
        directionLineGeometry.vertices.push(new Vector3(0, 0, -50)); // end of line
        directionLine = new Line(directionLineGeometry, directionLineMaterial);
        player.add(directionLine);
        console.log("Added Direction Line to player");
        
        // Pair camera with player
        player.add(camera);
        camera.position.set(0, 1, 0);
        
        // Sphere Object
        sphereGeometry = new SphereGeometry(2, 32, 32);
        sphereMaterial = Physijs.createMaterial(new LambertMaterial({color: 0x00ff00}), 0, 0);
        sphere = new Physijs.SphereMesh(sphereGeometry, sphereMaterial, 1);
        sphere.position.set(-5, 5, -5);
        sphere.receiveShadow = true;
        sphere.castShadow = true;
        sphere.name = "Sphere";
        scene.add(sphere);
        console.log("Added Sphere to Scene");
        
        
        // add controls
        gui = new GUI();
        control = new Control();
        addControl(control);

        // Add framerate stats
        addStatsObject();
        console.log("Added Stats to scene...");

        document.body.appendChild(renderer.domElement);
        gameLoop(); // render the scene	
        scene.simulate();
        
        window.addEventListener('resize', onWindowResize, false);
    }
    
    //PointerLockChange Event Handler
    function pointerLockChange(event): void {
        if (document.pointerLockElement === element) {
            // enable our mouse and keyboard controls
            keyboardControls.enabled = true;
            mouseControls.enabled = true;
            blocker.style.display = 'none';
        } else {
            // disable our mouse and keyboard controls
            keyboardControls.enabled = false;
            mouseControls.enabled = false;
            blocker.style.display = '-webkit-box';
            blocker.style.display = '-moz-box';
            blocker.style.display = 'box';
            instructions.style.display = '';
            console.log("PointerLock disabled");
        }
    }
    
    //PointerLockError Event Handler
    function pointerLockError(event): void {
        instructions.style.display = '';
        console.log("PointerLock Error Detected!!");
    }
    
    // Window Resize Event Handler
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function addControl(controlObject: Control): void {
        /* ENTER CODE for the GUI CONTROL HERE */
    }

    // Add Frame Rate Stats to the Scene
    function addStatsObject() {
        stats = new Stats();
        stats.setMode(0);
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        document.body.appendChild(stats.domElement);
    }

    // Setup main game loop
    function gameLoop(): void {
        stats.update();
        
        checkControls();
        
        // render using requestAnimationFrame
        requestAnimationFrame(gameLoop);
	
        // render the scene
        renderer.render(scene, camera);
    }
    
    // Check controls function
    function checkControls(): void {
        if (keyboardControls.enabled) {
            velocity = new Vector3();
            var time: number = performance.now();
            var delta: number = (time-prevTime) / 1000;
            
            if (isGrounded) {
                var direction = new Vector3(0, 0, 0);
                
                if (keyboardControls.moveForward) {
                    velocity.z -= 500.0 * delta;
                }
                if (keyboardControls.moveLeft) {
                    velocity.x -= 500.0 * delta;
                }
                if (keyboardControls.moveBackward) {
                    velocity.z += 500.0 * delta;
                }
                if (keyboardControls.moveRight) {
                    velocity.x += 500.0 * delta;
                }
                if (keyboardControls.jump) {
                    velocity.y += 10000.0 * delta;
                    if (player.position.y > 5) {
                        isGrounded = false;
                    }
                }
                
                player.setDamping(0.7, 0.1);
                player.setAngularVelocity(new Vector3(0, mouseControls.yaw, 0));
                direction.addVectors(direction, velocity); // add velocity to player vector
                direction.applyQuaternion(player.quaternion); // apply player angle
                
                 if (Math.abs(player.getLinearVelocity().x) < 20 && Math.abs(player.getLinearVelocity().y) < 10) {
                    player.applyCentralForce(direction);
                }
                
                // cameraLook();
            }
            
            prevTime = time;
        }
        else {
            player.setAngularVelocity(new Vector3(0, 0, 0));
        }
    }
    
    // Camera look function
    function cameraLook(): void {
        var zenith: number = THREE.Math.degToRad(90);
        var nadir: number = THREE.Math.degToRad(-90);
        var cameraPitch: number = camera.rotation.x + mouseControls.pitch;
        
        camera.rotation.x = THREE.Math.clamp(cameraPitch, nadir, zenith);
        
    }

    // Setup default renderer
    function setupRenderer(): void {
        renderer = new Renderer({ antialias: true });
        renderer.setClearColor(0x404040, 1.0);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(CScreen.WIDTH, CScreen.HEIGHT);
        renderer.shadowMap.enabled = true;
        console.log("Finished setting up Renderer...");
    }

    // Setup main camera for the scene
    function setupCamera(): void {
        camera = new PerspectiveCamera(35, config.Screen.RATIO, 0.1, 1000);
        // camera.position.set(0, 150, 0);
        // camera.lookAt(new Vector3(0, 0, 0));
        // camera.rotation.z = 2 * Math.PI;
        console.log("Finished setting up Camera...");
    }

    window.onload = init;

    return {
        scene: scene
    }

})();


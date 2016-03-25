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
import Color = THREE.Color;
import Vector3 = THREE.Vector3;
import Face3 = THREE.Face3;
import CScreen = config.Screen;
import Clock = THREE.Clock;

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
    var boulderGeometry: SphereGeometry;
    var boulderMaterial: Physijs.Material;
    var boulder: Physijs.Mesh;
    var boulder2: Physijs.Mesh;
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
    var fireMaterial: Physijs.Material;
    var fireTraps: Physijs.Mesh[];
    var spikeMaterial: Physijs.Material;
    var spikeTraps: Physijs.Mesh[];
    var ladderGeometry: CubeGeometry;
    var ladderMaterial: Physijs.Material;
    var ladder: Physijs.Mesh;
    var coinMaterial: Physijs.Material;
    var coins: Physijs.ConcaveMesh[];
    var coinCount: number = 10;
    
    var gameOver: boolean = false;
    var blocker2: HTMLElement;
    var over: HTMLElement;
    
    var blocker3: HTMLElement;
    var win: HTMLElement;
    
    // CreateJS variables
    var assets: createjs.LoadQueue;
    var canvas: HTMLElement;
    var stage: createjs.Stage;
    var scoreLabel: createjs.Text;
    var livesLabel: createjs.Text;
    var score: number;
    var lives: number;
    
    var manifest = [
        {id: "music", src:"../../Assets/Sounds/soundtrack.mp3"},
        {id: "land", src:"../../Assets/Sounds/land.mp3"},
        {id: "coin", src:"../../Assets/Sounds/coin.mp3"},
        {id: "ouch", src:"../../Assets/Sounds/ouch.mp3"},
        {id: "scream", src:"../../Assets/Sounds/scream.mp3"},

    ];
    
    function preload(): void {
        assets = new createjs.LoadQueue();
        assets.installPlugin(createjs.Sound);
        assets.on("complete", init, this);
        assets.loadManifest(manifest);
    }
    
    function setupCanvas(): void {
        canvas = document.getElementById("canvas");
        canvas.setAttribute("width", config.Screen.WIDTH.toString());
        canvas.setAttribute("height", (config.Screen.HEIGHT * 0.1).toString());
        canvas.style.backgroundColor = "#000000";
        stage = new createjs.Stage(canvas);
    }
    
    function setupScoreBoard(): void {
        score = 0;
        lives = 5;
        
        scoreLabel = new createjs.Text("Score: " + score, "40px Consolas", "#ffffff");
        scoreLabel.x = config.Screen.WIDTH * 0.1;
        scoreLabel.y = (config.Screen.HEIGHT * 0.1) * 0.15;
        
        
        livesLabel = new createjs.Text("Lives: " + lives, "40px Consolas", "#ffffff");
        livesLabel.x = config.Screen.WIDTH * 0.8;
        livesLabel.y = (config.Screen.HEIGHT * 0.1) * 0.15;

        stage.addChild(scoreLabel);
        stage.addChild(livesLabel);
        
        console.log("Added scoreboard to stage");
    }
    
    function init(): void {        
        // Create to HTMLElements
        blocker = document.getElementById("blocker");
        instructions = document.getElementById("instructions");
        blocker2 = document.getElementById("blocker2");
        over = document.getElementById("over");
        blocker3 = document.getElementById("blocker3");
        win = document.getElementById("win");
        
        // Setup CreateJS Canvas and Stage and Scoreboard
        setupCanvas();
        setupScoreBoard();
        
        // Play soundtrack
        createjs.Sound.play("music", createjs.Sound.INTERRUPT_NONE, 0, 0, -1, 0.5, 0);
        
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
        
        // Point Lights
        pointLights = new Array<PointLight>();
        pointLights.push(new PointLight(0xffffff, 1, 55));
        pointLights.push(new PointLight(0xffffff, 1, 55));
        pointLights.push(new PointLight(0xffffff, 1, 55));
        pointLights.push(new PointLight(0xffffff, 1, 55));
        pointLights.push(new PointLight(0xffffff, 2, 10));
        pointLights.push(new PointLight(0xffffff, 2, 10));

        pointLights[0].position.set(28, 20, 28);
        pointLights[1].position.set(-28, 20, 28);
        pointLights[2].position.set(28, 20, -28);
        pointLights[3].position.set(-28, 20, -28);
        pointLights[4].position.set(22, 5, -26);
        pointLights[5].position.set(30, 5, -26);
        
        for (var i = 0; i < pointLights.length; i++) {
            pointLights[i].name = "Point Light " + i;
            scene.add(pointLights[i]);
            console.log("Added Point Lights to scene");
        }
        
        // Ground
        groundGeometry = new BoxGeometry(64, 1, 64);
        groundMaterial = Physijs.createMaterial(new PhongMaterial({ map: THREE.ImageUtils.loadTexture('../../Assets/Images/dirt.jpg'), side: THREE.DoubleSide }), 0, 0);
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
        
        // Ladder
        ladderGeometry = new BoxGeometry(1, 10, 4);
        ladderMaterial = Physijs.createMaterial(new LambertMaterial({ map: THREE.ImageUtils.loadTexture('../../Assets/Images/ladder.jpg'), side: THREE.DoubleSide }), 0, 0);
        ladder = new Physijs.ConvexMesh(ladderGeometry, ladderMaterial, 0);
        ladder.position.set(26, 5, -26);
        ladder.receiveShadow = true;
        ladder.name = "Ladder";
        scene.add(ladder);
        console.log("Added Ladder to scene");
        
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
        walls.push(new Physijs.BoxMesh(new BoxGeometry(54, 24, 2), wallMaterial, 0));
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

        walls[4].position.set(4, 12, -20);
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
            walls[i].name = "Wall"
            scene.add(walls[i]);
            console.log("Added Walls to scene");
        }
        
        // Fire traps
        fireTraps = new Array<Physijs.Mesh>();
        fireMaterial = Physijs.createMaterial(new LambertMaterial({ map: THREE.ImageUtils.loadTexture('../../Assets/Images/fire.jpg'), side: THREE.DoubleSide }), 0, 0);

        fireTraps.push(new Physijs.BoxMesh(new BoxGeometry(1, 2, 8), fireMaterial, 0));
        fireTraps.push(new Physijs.BoxMesh(new BoxGeometry(1, 2, 8), fireMaterial, 0));
        fireTraps.push(new Physijs.BoxMesh(new BoxGeometry(1, 2, 12), fireMaterial, 0));
        fireTraps.push(new Physijs.BoxMesh(new BoxGeometry(1, 2, 12), fireMaterial, 0));
        fireTraps.push(new Physijs.BoxMesh(new BoxGeometry(1, 2, 12), fireMaterial, 0));
        fireTraps.push(new Physijs.BoxMesh(new BoxGeometry(1, 2, 12), fireMaterial, 0));
        fireTraps.push(new Physijs.BoxMesh(new BoxGeometry(1, 2, 12), fireMaterial, 0));
        fireTraps.push(new Physijs.BoxMesh(new BoxGeometry(1, 2, 12), fireMaterial, 0));
        fireTraps.push(new Physijs.BoxMesh(new BoxGeometry(1, 2, 12), fireMaterial, 0));
        fireTraps.push(new Physijs.BoxMesh(new BoxGeometry(1, 2, 12), fireMaterial, 0));
        fireTraps.push(new Physijs.BoxMesh(new BoxGeometry(10, 2, 1), fireMaterial, 0));
        fireTraps.push(new Physijs.BoxMesh(new BoxGeometry(8, 2, 1), fireMaterial, 0));
        
        fireTraps[0].position.set(0, 1, 15);
        fireTraps[1].position.set(0, 1, -15);
        fireTraps[2].position.set(-8, 1, 25);
        fireTraps[3].position.set(5, 1, 25);
        fireTraps[4].position.set(18, 1, 25);
        fireTraps[5].position.set(-16, 1, -25);
        fireTraps[6].position.set(-8, 1, -25);
        fireTraps[7].position.set(0, 1, -25);
        fireTraps[8].position.set(8, 1, -25);
        fireTraps[9].position.set(16, 1, -25);
        fireTraps[10].position.set(-16, 1, 14);
        fireTraps[11].position.set(15, 1, 0);
        
        for (var i = 0; i < fireTraps.length; i++) {
            fireTraps[i].receiveShadow = true;
            fireTraps[i].name = "Fire";
            scene.add(fireTraps[i]);
            console.log("Added Fire to scene");
        }
        
         // Boulder
        boulderGeometry = new SphereGeometry(3, 32, 32);
        boulderMaterial = Physijs.createMaterial(new LambertMaterial({map: THREE.ImageUtils.loadTexture('../../Assets/Images/boulder.jpg')}), 0, 0);
        boulder = new Physijs.SphereMesh(boulderGeometry, boulderMaterial, 1);
        boulder.position.set(-27, 2, -5);
        boulder.receiveShadow = true;
        boulder.castShadow = true;
        boulder.name = "Boulder";
        scene.add(boulder);
        console.log("Added Boulder to Scene");
       
        boulder2 = new Physijs.SphereMesh(boulderGeometry, boulderMaterial, 1);
        boulder2.position.set(-27, 2, 26);
        boulder2.receiveShadow = true;
        boulder2.castShadow = true;
        boulder2.name = "Boulder";
        scene.add(boulder2);
        console.log("Added Boulder to Scene");
 
        // Coins
        addCoinMesh();
 
        // Player Object
        playerGeometry = new BoxGeometry(2, 2, 2);
        playerMaterial = Physijs.createMaterial(new LambertMaterial({color: 0x00ff00}), 0, 0);
        player = new Physijs.BoxMesh(playerGeometry, playerMaterial, 1);
        player.position.set(26, 2, -16);
        
        // FOR TESTING PURPOSES
        // player.position.set(-12, 2, -5);

        player.rotation.y = Math.PI;
        player.receiveShadow = true;
        player.castShadow = true;
        player.name = "Player";
        scene.add(player);
        console.log("Added Player to Scene");
        
        player.addEventListener('collision', function(e) {
           if (e.name === "Ground") {
               isGrounded = true;
               createjs.Sound.play("land");
           }
           if (e.name === "Boulder") {
               if (lives > 0) {
                   lives += -lives;
               }
               createjs.Sound.play("scream");
               livesLabel.text = "Lives: " + lives;
           }
           if (e.name === "Fire") {
               isGrounded = true;
               if (lives > 0) {
                   lives += -1;
               }
               createjs.Sound.play("ouch");
               livesLabel.text = "Lives: " + lives;
           }
           if (e.name === "Coin") {
               score += 100;
               createjs.Sound.play("coin");
               scene.remove(e);
               setCoinPosition(e);
               scoreLabel.text = "Score: " + score;
           }
           if (e.name === "Ladder") {
               // disable our mouse and keyboard controls
                keyboardControls.enabled = false;
                mouseControls.enabled = false;
                blocker.style.display = 'none';
                instructions.style.display = 'none';
                
                blocker3.style.display = '-webkit-box';
                blocker3.style.display = '-moz-box';
                blocker3.style.display = 'box';
                
                document.exitPointerLock();
                
           }
        });
        
        // Add Direction Line
        directionLineMaterial = new LineBasicMaterial({color:0xffff00});
        directionLineGeometry = new Geometry();
        directionLineGeometry.vertices.push(new Vector3(0, 0, 0)); // line origin
        directionLineGeometry.vertices.push(new Vector3(0, 0, -50)); // end of line
        directionLine = new Line(directionLineGeometry, directionLineMaterial);
        // player.add(directionLine);
        console.log("Added Direction Line to player");
        
        // Pair camera with player
        player.add(camera);
        camera.position.set(0, 1, 0);

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
    
    // Check game over
    function checkGameOver(): void {
        if (gameOver) {
            // disable our mouse and keyboard controls
            keyboardControls.enabled = false;
            mouseControls.enabled = false;
            blocker.style.display = 'none';
            instructions.style.display = 'none';
            
            blocker2.style.display = '-webkit-box';
            blocker2.style.display = '-moz-box';
            blocker2.style.display = 'box';
            
            document.exitPointerLock();
            
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
        
        canvas.style.width = '100%';
        
        scoreLabel.x = config.Screen.WIDTH * 0.1;
        scoreLabel.y = (config.Screen.HEIGHT * 0.1) * 0.15;
        livesLabel.x = config.Screen.WIDTH * 0.8;
        livesLabel.y = (config.Screen.HEIGHT * 0.1) * 0.15;
        
        stage.update();
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
    
    // Add Coin to scene
    function addCoinMesh(): void {
        coins = new Array<Physijs.ConvexMesh>(); // Instantiate a convex mesh array
        
        var coinLoader = new THREE.JSONLoader().load("../../Assets/imported/coin.json", function(geometry: THREE.Geometry) {
              var phongMaterial = new PhongMaterial({ color: 0xE7AB32 });
              phongMaterial.emissive = new THREE.Color(0xE7AB32);        
              
              var coinMaterial = Physijs.createMaterial((phongMaterial), 0.4, 0.6);
              for(var count = 0; count < coinCount; count++) {
                 coins[count] = new Physijs.ConvexMesh(geometry, coinMaterial);     
                 coins[count].receiveShadow = true;
                 coins[count].castShadow = true;
                 coins[count].name = "Coin";
                 setCoinPosition(coins[count]);
              }
          });
  
          console.log("Added Coin Mesh to Scene");
        
    }

    // Set Coin position
    function setCoinPosition(coin:Physijs.ConvexMesh): void {
        var randomPointX: number = Math.floor(Math.random() * 32) - Math.floor(Math.random() * 32);
        var randomPointZ: number = Math.floor(Math.random() * 32) - Math.floor(Math.random() * 32);
        coin.position.set(randomPointX, 2, randomPointZ);
        scene.add(coin);
    }

    // Setup main game loop
    function gameLoop(): void {
        stats.update();
        
        if (lives == 0) {
            gameOver = true;
        }
               
        if (boulder.position.z > -28) {
            if (player.position.x < -20 && player.position.z < -10) {
                boulder.applyCentralForce(new Vector3(0, 0, -4));
                boulder.setAngularVelocity(new Vector3(-1, 0, 0));
            }
        }
        else {
            boulder.setLinearVelocity(new Vector3(0, 0, 0));
            boulder.setAngularVelocity(new Vector3(0, 0, 0));
        }
        
        if (boulder2.position.z > 4) {
            if (player.position.x < -20 && player.position.z < 14) {
                boulder2.applyCentralForce(new Vector3(0, 0, -8));
                boulder2.setAngularVelocity(new Vector3(-2, 0, 0));
            }
        }
        else {
            boulder.setLinearVelocity(new Vector3(0, 0, 0));
            boulder.setAngularVelocity(new Vector3(0, 0, 0));
        }
                
        for (var i = 0; i < coins.length; i++) {
            coins[i].setAngularVelocity(new Vector3(0, 1, 0));
            coins[i].setLinearVelocity(new Vector3(0, 0, 0));
        }
        
        checkGameOver();
        
        checkControls();
        stage.update();
        
        
                
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
                
                cameraLook();
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

    window.onload = preload;

    return {
        scene: scene
    }

})();

// Add ceiling, change start position, change camera perspective
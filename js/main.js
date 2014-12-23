/*
 Simple Panaroma viewer uses orbit controls to rotate camera.
 */


(function (world) {
    "use strict";
	// variables
	var sceneNo, defaultData, effectController, trans_obj,
        camPos  = [
            new THREE.Vector3(0, 146.304, 0)
           
        ],
        panoOffset = [
            new THREE.Vector3(-Math.PI, 0, 0)
	    
        ],
        
    
		gui = new dat.GUI();
	
	
	//world.scene = {};
	
	
	// list of panoramas available in the world
	
	world.skyboxs = [
		'servelots2'
	];
	
	function bind(scope, func) {
        return function bound() {
            func.apply(scope, arguments);
        };
    }
	
	
	function setupGUI() {
		effectController = {
			//scene Controls
			sceneNum: 0
		};
		
		var h1;
		h1 = gui.addFolder("Scene Controls");
		h1.add(effectController, "sceneNum", {1: 0, 2: 1, 3:2, 4:3, 5:4, 6:5, 7:6}).name("Scene");
		//gui.remember(effectController);
		gui.close();
		dat.GUI.toggleHide();
	}
	
	setupGUI();
	/*
	 * init the scene, setup the camera, draw 3D objects and start the game loop
	 */
	world.init = function () {
		// default pano is the first one
		sceneNo = 0;
				
		//Camera Properties Initialization
		var fov = 45, aspect_ratio = window.innerWidth / window.innerHeight,
			near = 0.1, far = 50000;
		this.cam = new THREE.PerspectiveCamera(fov, aspect_ratio, near, far);
		
		
		// Renderer Initialization
		if (Detector.webgl) {
            this.renderer = new THREE.WebGLRenderer({antialias: false});
        } else {
            this.renderer = new THREE.CanvasRenderer();
        }
        this.renderer.setSize(window.innerWidth, window.innerHeight);
		document.getElementById('container').appendChild(this.renderer.domElement);
		//this.renderer.shadowMapEnabled = true;

		
		// Camera Controls initialization
		this.controls = new THREE.OrbitControls(this.cam, this.renderer.domElement);
		this.controls.noPan = false;
		this.controls.noZoom = true;
		
		this.controls.staticMoving = true;
		this.controls.addEventListener('change', bind(this, this.render));
		this.controls.dynamicDampingFactor = 0.3;
	
		// Transformation Controls initialization
		
		
		this.fillScene();
		
	};

	world.fillScene = function () {
			
			//this.scene=null;
			
	    this.scene = new THREE.Scene();
	    
		//this.renderer.clear();
    		this.renderer.clear( true);
		//this.renderer.autoClear();
		this.currentSkybox = this.skyboxs[sceneNo];				
		this.makeSkyBox();		
		this.cam.position.set(camPos[sceneNo].x, camPos[sceneNo].y, camPos[sceneNo].z);
		this.cam.updateProjectionMatrix;
		this.scene.add(this.cam);
		this.controls.center.set(camPos[sceneNo].x - 0.1, camPos[sceneNo].y, camPos[sceneNo].z);			
		
		// attach event handlers
		window.addEventListener('resize',
			bind(this, this.eventHandlers.onWindowResize), false);
		this.renderer.domElement.addEventListener( 'mousewheel',
					bind(this, this.eventHandlers.onDocumentMouseWheel), false );
				this.renderer.domElement.addEventListener( 'DOMMouseScroll',
							bind(this, this.eventHandlers.onDocumentMouseWheel),false);
		

		//this.scene.add(this.helper);
				// action!
		this.animate.apply(this, arguments);
		
	};
	
	world.animate = function () {
	
          
        requestAnimationFrame(world.animate);
        world.controls.update();
	//world.update();
        world.render.apply(world, arguments);
    };

	world.render = function () {
		//this.helper.update();
		
		
		if (effectController.sceneNum !== sceneNo) {
			sceneNo = effectController.sceneNum;
			console.log(sceneNo);
			//this.scene=null;
			//this.scene.removeObject(panoMesh);
			this.fillScene();
		}
		this.renderer.render(this.scene, this.cam);
		
		
	};
	
var panoMesh, panoMeshMat, panoMeshGeo, cubeTex;
	/* Functions to draw different kinds of objects/system in the scene */
	world.makeSkyBox = function () {
		var wireframe = 0,

          url = [ 'panoramas/' + this.currentSkybox + '/posx.jpg',
					'panoramas/'+ this.currentSkybox + '/negx.jpg',
					'panoramas/' + this.currentSkybox + '/posy.jpg',
					'panoramas/' + this.currentSkybox + '/negy.jpg',
					'panoramas/' + this.currentSkybox + '/posz.jpg',
					'panoramas/' + this.currentSkybox + '/negz.jpg'],
            //textureCube = THREE.ImageUtils.loadTextureCube(url),
            //material = new THREE.MeshBasicMaterial({ color: 0xffffff, envMap: textureCube }),

            panoMeshGeo = new THREE.BoxGeometry(-5, -5, -5),
            materialArray = [],
            panoMeshMat,
            i,
            cubeTex;
		for (i = 0; i < 6; i++) {
			cubeTex = THREE.ImageUtils.loadTexture(url[i]);
			//cubeTex.offset.x = -.5;
			//cubeTex.offset.y = -.5;
			materialArray.push(new THREE.MeshBasicMaterial({
				map: cubeTex,
				side: THREE.FrontSide
			}));
		}
		panoMeshMat = new THREE.MeshFaceMaterial(materialArray);
		
		//this.panoMesh = new THREE.Mesh( new THREE.BoxGeometry(50000, 50000, 50000, 1, 1, 1, null, true ), material);
		this.panoMesh = new THREE.Mesh(panoMeshGeo, panoMeshMat);
		this.panoMesh.rotation.set(panoOffset[sceneNo].x, panoOffset[sceneNo].y, panoOffset[sceneNo].z);
		this.panoMesh.position.set(camPos[sceneNo].x, camPos[sceneNo].y, camPos[sceneNo].z);
		this.panoMesh.name = 'Pano Cube';
        //this.panoMesh.scale.x = 1;
        this.scene.add(this.panoMesh);
	
	
				//this.scene.remove(this.panoMesh);
			//this.renderer.deallocateObject( panoMesh );
			//this.renderer.deallocateTexture( panoMeshMat );
			//this.renderer.deallocateTexture( cubeTex );
			//this.panoMesh.dispose();
			//this.panoMeshMat.dispose();
			//this.panoMeshGeo.dispose();

    };

	


	// all event handlers of the 3D world
	world.eventHandlers = {
	     onDocumentMouseWheel: function (event) {
		
				// WebKit
console.log(this.cam.fov);
				if ( event.wheelDeltaY ) {

					this.cam.fov -= event.wheelDeltaY * 0.005;

				// Opera / Explorer 9

				} else if ( event.wheelDelta ) {

					this.cam.fov -= event.wheelDelta * 0.005;

				// Firefox

				} else if ( event.detail ) {

					this.cam.fov -= event.detail * 0.05;

				}
				

				this.cam.updateProjectionMatrix();

			},
        
		onWindowResize: function (event) {
			this.aspect_ratio = window.innerWidth / window.innerHeight;
			this.cam.aspect = this.aspect_ratio;
			this.cam.updateProjectionMatrix();

			this.renderer.setSize(window.innerWidth, window.innerHeight);

			//this.controls.handleResize();
			this.render();
		}
	};

				


})(world);

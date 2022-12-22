import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Surface } from './SimulationInput';
import { Vehicle } from './Vehicle';

/**
 * Klass för att skapa en 3D miljö för simuleringen.
 */

export class SimulationEnvironment {

    canvas: HTMLElement;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    fov: number; // Field of view
    aspectRatio: number;
    near: number;
    far: number;
    renderer: THREE.WebGLRenderer;
    
    // Nedan tillhör genering av yta.
    surfaceSize: Surface;
    surfaceGeometry: THREE.BoxGeometry | null;
    surfaceMesh: THREE.Mesh | null;
    surfaceEdge: THREE.EdgesGeometry | null;
    surfaceLines: THREE.LineSegments | null;
    surfaceLineMaterial: THREE.LineBasicMaterial | null;
    surfaceArray: THREE.Mesh[];

    // Fordon
    vehicle: Vehicle;
    startingPos: THREE.Vector3;
    startingDir: string;

    constructor(surfaceSize: Surface, startingPos: THREE.Vector3, startingDir: string) {
        this.canvas = document.getElementById('webgl')!;
        this.scene = new THREE.Scene();
        this.fov = 75;
        this.aspectRatio = window.innerWidth / window.innerHeight;
        this.near = 0.5;
        this.far = 100;
        this.camera = new THREE.PerspectiveCamera(this.fov, this.aspectRatio, this.near, this.far);
        this.controls = new OrbitControls(this.camera, this.canvas);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas! });
        
        // Wut...? Bra att veta det grundläggande beteendet/syftet för en konstruktor.
        // Värden sätts till null vid ny instans för att enkelt kunna hantera radering av tidigare värden vid fler simuleringar.
        this.surfaceSize = surfaceSize;
        
        // Sen kan man så klart initiera medlemmarna inline där de definieras.
        this.surfaceGeometry = null;
        this.surfaceMesh = null;
        this.surfaceEdge = null;
        this.surfaceLines = null;
        this.surfaceLineMaterial = null;
        this.surfaceArray = [];

        this.startingPos = startingPos;
        this.startingDir = startingDir;
        this.vehicle = new Vehicle(this.startingPos, this.startingDir, this.surfaceSize);

        this.camera.position.set(10,20,10);
        this.camera.lookAt(new THREE.Vector3(0,0,0)); // Rikta kameran mot world origin.

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.render(this.scene, this.camera);

        window.addEventListener('resize', () => {
            this.OnResize();
        });

    }

    GenerateSurface() {
        // Denna del ser till att radera/ta bort föregående simuleringsyta ifall det finns.
        if(this.surfaceMesh !== null) {
            this.surfaceGeometry?.dispose();
            this.surfaceEdge?.dispose();
            this.scene.remove(this.surfaceMesh, this.surfaceLines!);
        }

        this.surfaceGeometry = new THREE.BoxGeometry(1,1,1);
        this.surfaceEdge = new THREE.EdgesGeometry(this.surfaceGeometry);
        this.surfaceLineMaterial = new THREE.LineBasicMaterial({
            color: 0x000000,
            linewidth: 1,
            linecap: 'round',
            linejoin: 'round'
        })

        // Generingen av ytan. För att använda world origin som (0,0) genereras ytan från negativa värden till positiva.
        // Det innebär att placering av fordon sker vid en yta (10*10) mellan -5 -> 4.
        for(let i=Math.ceil(-this.surfaceSize.row/2); i<Math.ceil(this.surfaceSize.row/2); i++) {
            for(let j=Math.ceil(-this.surfaceSize.col/2); j<Math.ceil(this.surfaceSize.col/2); j++) {
                this.surfaceMesh = new THREE.Mesh(this.surfaceGeometry, new THREE.MeshBasicMaterial({color: 0xeeeeee}));
                this.surfaceLines = new THREE.LineSegments(this.surfaceEdge, this.surfaceLineMaterial);
                this.surfaceMesh.position.set(i, 0, j);
                this.surfaceLines.position.set(i, 0, j);
                this.scene.add(this.surfaceMesh, this.surfaceLines);
                this.surfaceArray.push(this.surfaceMesh);
            }
        }
        // Lägg till fordonet i scenen efter generering av ytan.
        this.scene.add(this.vehicle.mesh);
    }

    private OnResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect =  width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

}

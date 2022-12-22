import { Mesh, BoxGeometry, MeshBasicMaterial, Group, Vector3 } from 'three';
import { Surface } from './SimulationInput';

export interface SurfaceBoundries {
    positiveX: number;
    negativeX: number;
    positiveZ: number;
    negativeZ: number;
}

/**
 * Klass för fordon.
 */

export class Vehicle {

    startPosition: Vector3;
    position: Vector3;
    direction: string;
    directionMap: Map<string, number>;
    outOfBounds: boolean;
    surfaceBoundries: SurfaceBoundries;
    mesh: Group;
    truck: Mesh;
    headLights: Mesh;

    constructor(startPosition: THREE.Vector3, startDirection: string, surfaceSize: Surface) {
        this.startPosition = startPosition;
        this.position = startPosition;
        this.direction = startDirection;
        this.directionMap = new Map([
            ['N', Math.PI * 0.5],
            ['S', Math.PI * -0.5],
            ['E', Math.PI],
            ['W', Math.PI * 2]
        ]);
        this.outOfBounds = false;
        this.surfaceBoundries = {
            positiveX: Math.ceil(surfaceSize.row/2) - 1,
            negativeX: Math.ceil(-surfaceSize.row/2),
            positiveZ: Math.ceil(surfaceSize.col/2) - 1,
            negativeZ: Math.ceil(-surfaceSize.col/2)
        };
        this.mesh = new Group();
        this.truck = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({color: 0x0000ff}));
        this.headLights = new Mesh(new BoxGeometry(0.2, 0.2, 0.2), new MeshBasicMaterial({color: 0xffff22}));
        this.headLights.position.z -= 0.5;
        this.mesh.add(this.truck, this.headLights)
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.mesh.rotation.y -= this.directionMap.get(this.direction)!;
    }

    Execute(commands: string[], surfaceArray: Mesh[]) {
        let tempPosition: Vector3;
        for(const command of commands) {

            // Används för att plocka ut korrekt ytdel för färg ändring.
            tempPosition = new Vector3(this.mesh.position.x, 0, this.mesh.position.z);
            const surfaceMesh = surfaceArray.find(mesh => mesh.position.equals(tempPosition));
            
            if(!this.outOfBounds) {
                switch(command) {
                    case 'F':
                        // Klassisk klipp-och-klistra istället för att ursilja att det enda som skiljer är tecknet på rörelsen
                        if(this.direction === 'N' && this.position.x < this.surfaceBoundries.positiveX) {
                            this.mesh.position.x += 1;
                            // Mer repetition...
                            (surfaceMesh?.material as any).color.set('#00ff00');
                        }
                        else if(this.direction === 'S' && this.position.x > this.surfaceBoundries.negativeX) {
                            this.mesh.position.x -= 1;
                            (surfaceMesh?.material as any).color.set('#00ff00');
                        }
                        else if(this.direction === 'E' && this.position.z < this.surfaceBoundries.positiveZ) {
                            this.mesh.position.z += 1;
                            (surfaceMesh?.material as any).color.set('#00ff00');
                        }
                        else if(this.direction === 'W' && this.position.z > this.surfaceBoundries.negativeZ) {
                            this.mesh.position.z -= 1;
                            (surfaceMesh?.material as any).color.set('#00ff00');
                        }
                        else {
                            this.outOfBounds = true;
                            (surfaceMesh?.material as any).color.set('#ff0000');
                        }
                        // Gör start positionsytan blå.
                        if(surfaceMesh?.position.x === this.startPosition.x && surfaceMesh.position.z === this.startPosition.z)
                            (surfaceMesh.material as any).color.set('#0000ff');

                        this.position = this.mesh.position;
                        break;

                    case 'B':
                        if(this.direction === 'N' && this.position.x > this.surfaceBoundries.negativeX) {
                            this.mesh.position.x -= 1;
                            (surfaceMesh?.material as any).color.set('#00ff00');
                        }
                        else if(this.direction === 'S' && this.position.x < this.surfaceBoundries.positiveX) {
                            this.mesh.position.x += 1;
                            (surfaceMesh?.material as any).color.set('#00ff00');
                        }
                        else if(this.direction === 'E' && this.position.z > this.surfaceBoundries.negativeZ) {
                            this.mesh.position.z -= 1;
                            (surfaceMesh?.material as any).color.set('#00ff00');
                        }
                        else if(this.direction === 'W' && this.position.z < this.surfaceBoundries.positiveZ) {
                            this.mesh.position.z += 1;
                            (surfaceMesh?.material as any).color.set('#00ff00');
                        }
                        else {
                            this.outOfBounds = true;
                            (surfaceMesh?.material as any).color.set('#ff0000');
                        }
                        // Gör start positionsytan blå.
                        if(surfaceMesh?.position.x === this.startPosition.x && surfaceMesh.position.z === this.startPosition.z)
                            (surfaceMesh.material as any).color.set('#0000ff');

                        this.position = this.mesh.position;
                        break;

                        // :-)
                        const dirs = "NESW";
                        let move = 0;
                        case 'R': move = 1; break;
                        case 'L': move = -1; break;
                        ...
                        this.direction = dirs[dirs.indexOf(this.direction) + move + 4) % 4];
                        this.mesh.rotation.y -= move * Math.PI * 0.5
                        
                    case 'R':
                        this.mesh.rotation.y -= Math.PI * 0.5;
                        if(this.direction === 'N')
                            this.direction = 'E';
                        else if(this.direction === 'S')
                            this.direction = 'W';
                        else if(this.direction === 'E')
                            this.direction = 'S';
                        else if(this.direction === 'W')
                            this.direction = 'N';
                        break;

                    case 'L':
                        this.mesh.rotation.y += Math.PI * 0.5;
                        if(this.direction === 'N')
                            this.direction = 'W';
                        else if(this.direction === 'S')
                            this.direction = 'E';
                        else if(this.direction === 'E')
                            this.direction = 'N';
                        else if(this.direction === 'W')
                            this.direction = 'S';
                        break;
                }
            }
        }
    }
}

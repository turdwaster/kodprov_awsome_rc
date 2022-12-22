import { Vector3 } from "three";
import { SurfaceBoundries } from "./Vehicle";

export interface Surface {
    row: number;
    col: number;
}

/**
 * Klass för hantering av input för simulering.
 */

export class SimulationInput {

    form: HTMLFormElement;
    startBtn: HTMLElement;
    surfaceSize: Surface;
    surfaceBoundries: SurfaceBoundries;
    commands: string[];
    startingPos: Vector3;
    startingDir: string;
    validInput: boolean;

    constructor() {
        this.form = document.getElementById('sim_form') as HTMLFormElement;
        this.startBtn = document.getElementById('start_sim')!;
        this.surfaceSize = {row: 0, col: 0};
        this.surfaceBoundries = {positiveX: 0, negativeX: 0, positiveZ: 0, negativeZ: 0};
        this.commands = [];
        this.startingPos = new Vector3(0, 0, 0);
        this.startingDir = '';
        this.validInput = false;
    }

    // Metoden heter Get... men returnerar inget
    GetInputData() {
        const inputData = new FormData(this.form);
        this.validInput = this.ValidateInput(inputData.get('surfaceSize') as string, 
                                             inputData.get('startingPos') as string, 
                                             inputData.get('startingDir') as string,
                                             inputData.get('commands') as string);
        if(this.validInput) {
            this.form.style.display = 'none';
            this.startBtn.style.display = 'block';
        }
    }
    
    private ValidateInput(surfaceSize: string, startingPos: string, startingDir: string, commands: string): boolean {
        // Kontrollera input för ytan
        const size = surfaceSize.split('*');
        const row = parseInt(size[0]);
        const col = parseInt(size[1]);
        if(Number.isNaN(row) || Number.isNaN(col))
            return false;
        this.surfaceSize = {row: row, col: col};
        
        // Kontrollera input för start position
        this.surfaceBoundries = {
            positiveX: Math.ceil(this.surfaceSize.row/2) - 1,
            negativeX: Math.ceil(-this.surfaceSize.row/2),
            positiveZ: Math.ceil(this.surfaceSize.col/2) - 1,
            negativeZ: Math.ceil(-this.surfaceSize.col/2)
        };

        const position = startingPos.split(',');
        const x = parseInt(position[0]);
        const z = parseInt(position[1]);
        
        // Pluspoäng för ordentlig felhantering (I'm looking at you, Gustaf)
        if(Number.isNaN(x) || Number.isNaN(z))
            return false;

        this.startingPos = new Vector3(x, 1, z);
        
        if(this.startingPos.x > this.surfaceBoundries.positiveX || this.startingPos.x < this.surfaceBoundries.negativeX)
            return false;
        if(this.startingPos.z > this.surfaceBoundries.positiveZ || this.startingPos.z < this.surfaceBoundries.negativeZ)
            return false;

        // Kontrollera input för start riktning
        const validDirections = ['N','S','E','W'];
        // Värdena lagras först och kontrolleras sen?
        this.startingDir = startingDir.toUpperCase();
        if(!validDirections.includes(this.startingDir))
            return false;
        
        // Kontrollera input för kommandon
        const validCommands = ['F','B','R','L'];
        this.commands = Array.from(commands.toUpperCase());
        for(const c of commands) {
            if(!validCommands.includes(c.toUpperCase()))
                return false;
        }

        return true;
    }
}

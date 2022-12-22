import { Vector3, Mesh } from "three";
import { SimulationEnvironment } from "./SimulationEnvironment";
import { SimulationInput } from "./SimulationInput";

interface SimulationSummary {
    successful: boolean;
    vehiclePos: Vector3;
    vehicleDir: string;
}

/**
 * Klass för simulering.
 */

export class Simulation {

    simData: SimulationInput;
    surface: SimulationEnvironment | null;
    summary: SimulationSummary;
    startBtn: HTMLElement;

    constructor() {
        this.simData = new SimulationInput();
        this.surface = null;
        this.summary = {successful: false, vehiclePos: new Vector3(0,0,0), vehicleDir: 'N'};
        this.startBtn = document.getElementById('start_sim')!;

        // No go. `try` i fel kontext...
        try {
            this.simData.form.addEventListener('submit', (event) => {
                event.preventDefault();
                this.simData.GetInputData();
                this.surface = new SimulationEnvironment(this.simData.surfaceSize, this.simData.startingPos, this.simData.startingDir);
            });
        }
        catch(e) {
            console.log(e);
            alert('Unable to create a WebGL context.');
        }

        this.startBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.StartSimulation();
            this.startBtn.style.display = 'none';
        });

        this.SimulationLoop();
    }

    private ExecuteCommands(surfaceArray: Mesh[] ) {
        if(this.simData.commands !== null && this.surface !== null) {
            this.surface.vehicle.Execute(this.simData.commands, surfaceArray);
        }
    }

    // Skapa html för att visa resultatet av simuleringen
    // Namngivning; verb saknas...
    private SimulationSummary(){
        let summaryDiv = document.createElement("div");
        
        summaryDiv.style.position = "fixed";
        summaryDiv.style.top = "0";
        summaryDiv.style.right = "0";
        summaryDiv.style.padding = "10px";
        summaryDiv.style.color = "#ffeeee";
        summaryDiv.style.backgroundColor = "#17315c";
        summaryDiv.style.borderRadius = "5px";
        summaryDiv.style.textAlign = "left";
        summaryDiv.style.whiteSpace = "pre-line";

        let resultText = document.createTextNode(`Simulation status:  ${this.summary.successful === true ? 'Successful' : 'Failed'}
                                                  Vehicle position:   (${this.summary.vehiclePos.x},${this.summary.vehiclePos.y},${this.summary.vehiclePos.z})
                                                  Vehicle direction:  ${this.summary.vehicleDir}
                                                  Executed commands:  ${this.simData.commands}`);
        summaryDiv.appendChild(resultText);

        document.body.appendChild(summaryDiv);
    }

    // Kör igång simuleringen. Genererar ytan och startar exekvering av kommandon samt visar resultatet av simuleringen.
    private StartSimulation() {
        if(this.simData.validInput && this.surface !== null) {
            this.surface.GenerateSurface();
            this.ExecuteCommands(this.surface.surfaceArray); // Passerar in en array med ytan för att möjliggöra färgläggning av specifika ytdelar
            this.summary.successful = (this.surface.vehicle.outOfBounds === true ? false : true);
            this.summary.vehiclePos = this.surface.vehicle.position;
            this.summary.vehicleDir = this.surface.vehicle.direction;
            this.SimulationSummary();
        }
    }

    private SimulationLoop() {
        window.requestAnimationFrame(() => {
            if(this.surface !== null) {
                
                const angle = (performance.now() / 1000 / 6 * 2 * Math.PI) * 0.3;
                this.surface!.camera.position.x = 10 * Math.sin(angle);
                this.surface!.camera.position.z = 10 * Math.cos(angle);
            
                this.surface?.controls.update();
                this.surface?.renderer.render(this.surface.scene, this.surface.camera);
            }
            this.SimulationLoop();
        });
    }
}

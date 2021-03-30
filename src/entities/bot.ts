import { DNA } from "../ga/dna";
import { Sample } from "./environment";

export enum BotActionType {
  MOVE,
  CLEAN,
  TURN_LEFT,
  TURN_RIGHT,
  MOVE_TO
}

export interface BotAction {
  type: BotActionType,
  data: any
}

interface Props {
  name: string;
  color: string;
  x: number;
  y: number;
  visionRadius: number;
  rotation: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'; 
  algorithm: (bot: Bot, canMove: boolean, samples: Sample[], otherBots?: Bot[]) => BotAction[]
  dna?: DNA;
}

export default class Bot {
  name: string;
  color: string;
  x: number;
  y: number;
  visionRadius: number = 0;
  path: {x: number, y: number}[];
  rotation: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  algorithm: (bot: Bot, canMove: boolean, samples: Sample[], otherBots?: Bot[]) => BotAction[]
  history: BotAction[]
  buffer: BotAction[]
  memory: Map<string, string>
  dna?: DNA;
  geneCounter: number;
  fitness: number;
  stack: {x: number, y: number}[]

  constructor(props: Props) {
    this.name = props.name;
    this.color = props.color;
    this.x = props.x;
    this.y = props.y
    this.rotation = props.rotation;
    this.visionRadius = props.visionRadius;
    this.algorithm = props.algorithm;
    this.path = [];
    this.history = [];
    this.buffer = [];
    this.memory = new Map();
    this.stack = [];
    this.geneCounter = 0;
    this.fitness = 0;
    this.dna = props.dna;

  }

  move(newPosition: {x: number, y: number}) {
    this.path.push({x: this.x, y: this.y});
    this.x = newPosition.x;
    this.y = newPosition.y;
  }

  hasInStack({x, y}: {x: number, y: number}) {
    return !!this.stack.find((p) => p.x === x && p.y === y);
  }

  hasVisited({x, y}: {x: number, y: number}) {
    return !!this.path.find((p) => p.x === x && p.y === y);
  }

  calculateNewPosition() {
    const rotation = this.rotation;
    let targetX = this.x;
    let targetY = this.y;
    switch(rotation) {
      case 'UP':
        targetY--;
        break;
      case 'DOWN':
        targetY++;
        break;
      case 'LEFT':
        targetX--;
        break;
      case 'RIGHT':
        targetX++;
        break;
    }
    return {x: targetX, y: targetY};
  }

  getPreviousAction() {
    return this.history.length > 0 ? this.history[this.history.length - 1] : undefined
  }

  calculateFitness(worldSize: number) {
    let uniqueLocations: {x: number, y: number}[] = [];
    this.path.forEach((p) => {
      if (uniqueLocations.filter((u) => u.x === p.x && u.y === p.y).length == 0) {
        uniqueLocations.push(p);
      }
    });
    this.fitness = uniqueLocations.length / (worldSize * worldSize);
  }

  rotate(left: boolean) {
    switch(this.rotation) {
      case 'UP':
        this.rotation = left ? 'LEFT' : 'RIGHT';
        break;
      case 'DOWN':
        this.rotation = left ? 'RIGHT' : 'LEFT';
        break;
      case 'LEFT':
        this.rotation = left ? 'DOWN' : 'UP';
        break;
      case 'RIGHT':
        this.rotation = left ? 'UP' : 'DOWN';
        break;
    }
  }

  collidesWith(x: number, y: number): boolean {
    return this.x === x && this.y === y
  }

  progress(canMove: boolean, samples: Sample[], otherBots?: Bot[]) {
    if (this.buffer.length == 0) {
      this.buffer = this.buffer.concat(this.algorithm(this, canMove, samples, otherBots));
    }
    const action = this.buffer.shift();
    if (action != undefined) {
      this.history.push(action);
    }
    return action;
  }

}
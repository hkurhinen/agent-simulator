import { GaAlgorithm } from "../algorithms/algorithms";
import Bot from "../entities/bot";
import { DNA } from "./dna";
import { v4 as uuidv4 } from 'uuid';

function map_range(value: number, low1: number, high1: number, low2: number, high2: number) {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

export class Population {

  population: Bot[]
  matingPool: Bot[]
  mutationRate: number;
  generation: 1

  constructor(size: number, mutationRate: number) {
    
    this.mutationRate = mutationRate;
    this.matingPool = [];
    this.generation = 1;
    
    this.population = [];
    for (let i = 0; i < size; i++) {
      let genes = []
      for(let g = 0; g < size; g++) {
        genes.push(DNA.getRandomGene());
      }
      this.population[i] = new Bot({
        name: uuidv4(),
        algorithm: GaAlgorithm,
        color: "blue",
        rotation: "UP",
        visionRadius: 1,
        x: 13,
        y: 10,
        dna: new DNA(genes)
      });
    }
  }

  calcFitness(worldSize: number) {
    for (let i = 0; i < this.population.length; i++) {
      this.population[i].calculateFitness(worldSize);
    }
  }

  naturalSelection() {
    this.matingPool = [];
    let maxFitness = this.getMaxFitness();
    for (let i = 0; i < this.population.length; i++) {
      let fitnessNormal = map_range(this.population[i].fitness, 0, maxFitness, 0, 1);
      let n = Math.floor(fitnessNormal * 100);
      for (let j = 0; j < n; j++) {
        this.matingPool.push(this.population[i]);
      }
    }
  }

  randomParent() {
    return this.matingPool[Math.floor(Math.random() * this.matingPool.length)];
  }

  generate() {
    for (let i = 0; i < this.population.length; i++) {
      let dnaA = this.randomParent().dna!;
      let dnaB = this.randomParent().dna!;
      let child = dnaA.crossover(dnaB);
      child.mutate(this.mutationRate);
      this.population[i] = new Bot({
        algorithm: GaAlgorithm,
        color: "blue",
        name: uuidv4(),
        rotation: 'UP',
        visionRadius: 1,
        x: 13,
        y: 10,
        dna: child
      });
    }
    this.generation++;
  }

  getMaxFitness() {
      var record = 0;
      for (var i = 0; i < this.population.length; i++) {
        if (this.population[i].fitness > record) {
          record = this.population[i].fitness;
        }
      }
      return record;
    }
  
  getGeneration() {
    return this.generation;
  }
  
  getAverage() {
    let total = 0;
    for (let i = 0; i < this.population.length; i++) {
      total += this.population[i].fitness;
    }
    return total / this.population.length;
  }
}
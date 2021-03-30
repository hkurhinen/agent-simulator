import _ from "lodash";
export enum Gene {
  UP,
  DOWN,
  LEFT,
  RIGT
}

export class DNA {
  genes: Gene[]

  constructor(genes: Gene[]) {
    this.genes = genes
  }

  static getRandomGene() {
    return _.sample(Object.values(Gene)) as Gene
  }

  crossover(partner: DNA) {
    let childgenes = [];
    let midpoint = Math.floor(Math.random() * this.genes.length);
    for (let i = 0; i < this.genes.length; i++) {
      if (i > midpoint) childgenes[i] = this.genes[i];
      else childgenes[i] = partner.genes[i];
    }
    let newchild = new DNA(childgenes);
    return newchild; 
  }

  mutate(mutationRate: number) {
    for (let i = 0; i < this.genes.length; i++) {
      if (Math.random() < mutationRate) {
        this.genes[i] = DNA.getRandomGene()
      }
    }
  }
}

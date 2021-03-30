import { Population } from "../ga/population";
import Bot, { BotAction, BotActionType } from "./bot";
import Room from "./room";
import Trash from "./trash";

export interface Props {
  size: number,
  rooms: Room[],
  bots: Bot[],
  trash: Trash[];
  ga: boolean;
  populationSize?: number
  mutationRate?: number
  lifetime?: number
}

export interface Sample {
  type: 'EMPTY' | 'TRASH' | 'WALL' | 'BOT' | 'OUT_OF_BOUNDS',
  x: number,
  y: number
}

export default class Environment {
  size: number;
  rooms: Room[];
  bots: Bot[];
  trash: Trash[];
  history: String[];
  ga: boolean;
  moves: number;
  population?: Population;
  populationSize?: number;
  mutationRate?: number;
  lifetime: number;
  lifeCounter: number;

  constructor({size, rooms, bots, trash, ga, populationSize, mutationRate, lifetime}: Props) {
    this.size = size;
    this.rooms = rooms;
    this.bots = bots;
    this.trash = trash;
    this.history = [];
    this.moves = 0;
    this.ga = ga;
    this.populationSize = populationSize;
    this.mutationRate = mutationRate;
    this.lifetime = lifetime || 0;
    this.lifeCounter = 0;

    if (ga) {
      this.population = new Population(populationSize || 0, mutationRate || 0);
    }
  }

  private canMove(bot: Bot) {
    const move = bot.calculateNewPosition();
    let targetX = move.x;
    let targetY = move.y;
    // Cannot move out from the world
    if (targetX < 0 || targetY < 0 || targetX > this.size || targetY > this.size) {
      return false;
    }

    return this.rooms.filter((r) => r.collidesWith(targetX, targetY)).length < 1;
  }

  private canMoveTo(targetX: number, targetY: number) {
    // Cannot move out from the world
    if (targetX < 0 || targetY < 0 || targetX > this.size || targetY > this.size) {
      return false;
    }

    return this.rooms.filter((r) => r.collidesWith(targetX, targetY)).length < 1;
  }

  private pickSamples(bot: Bot): Sample[] {
    const x = bot.x;
    const y = bot.y;
    const radius = bot.visionRadius;
    const samples = [];
    const minX = (x - radius);
    const maxX = (x + radius);
    const minY = (y - radius);
    const maxY = (y + radius);
    for (let i = minX; i <= maxX; i++) {
      for (let j = minY; j <= maxY; j++) {
        if (i < 0 || i > this.size || j < 0 || j > this.size) {
          samples.push({type: 'OUT_OF_BOUNDS', x: i, y: j});
          continue;
        }
        const roomSamples = this.rooms.filter(r => r.collidesWith(i, j));
        if (roomSamples.length > 0) {
          samples.push({type: 'WALL', x: i, y: j});
          continue;
        }
        const trashSamples = this.trash.filter(t => t.collidesWith(i, j));
        if (trashSamples.length > 0) {
          samples.push({type: 'TRASH', x: i, y: j});
          continue;
        }
        const botSamples = this.bots
          .filter((b => b.name !== bot.name))
          .filter((b => b.collidesWith(i, j)));
        if (botSamples.length > 0) {
          samples.push({type: 'BOT', x: i, y: j});
          continue;
        }
        samples.push({type: 'EMPTY', x: i, y: j});
      }
    }
    return samples as Sample[];
  }

  private appendHistory(bot: Bot, action: BotAction) {
    if (this.ga) {
      return
    }
    let text = 'UNKNOWN';
    switch (action.type) {
      case BotActionType.CLEAN:
        text = 'clean';
        break;
      case BotActionType.MOVE_TO:
      case BotActionType.MOVE:
        text = 'move';
        break;
      case BotActionType.TURN_LEFT:
        text = 'turn left';
        break;
      case BotActionType.TURN_RIGHT:
        text = 'turn right';
        break;
    }
    this.history.push(`Bot ${bot.name} performed action: ${text}`);
    this.moves++;
    if (this.history.length > 15) {
      this.history.shift();
    }
  }

  getBots() {
    let bots = this.ga && this.population ? this.population.population : this.bots; 
    return bots;
  }

  progress() {
    if (this.ga && this.lifeCounter > this.lifetime && this.population) {
      this.population.calcFitness(this.size);
      this.population.naturalSelection();
      this.population.generate();
      this.lifeCounter = 0;
      this.history.push(`Generation ${this.population.generation} started`);
    }
    this.lifeCounter++;
    let bots = this.ga && this.population ? this.population.population : this.bots;
    for (let i = 0; i < bots.length; i++) {
      let bot = bots[i];
      let otherBots = bots.filter((b) => b.name !== bot.name);
      let action = bot.progress(this.canMove(bot), this.pickSamples(bot), otherBots);
      if (action === undefined) {
        continue;
      }
      this.appendHistory(bot, action);
      if (action.type === BotActionType.MOVE_TO) {
        const where = action.data;
        if (!isNaN(where.x) && !isNaN(where.y) && this.canMoveTo(where.x, where.y)) {
          bot.move(where);
        }
      }
      else if (action.type === BotActionType.TURN_LEFT || action.type === BotActionType.TURN_RIGHT) {
        bot.rotate(action.type === BotActionType.TURN_LEFT);
      } else if (action.type === BotActionType.CLEAN) {
        this.trash = this.trash.filter((t => !t.collidesWith(bot.x, bot.y)));
        if (this.trash.length === 0) {
          alert(`Cleaned room with ${this.moves} moves.`);
        }
      } else if (action.type === BotActionType.MOVE && this.canMove(bot)) {
        bot.move(bot.calculateNewPosition());
      }
    }
  }
}
import Bot, { BotAction, BotActionType } from "../entities/bot";
import { Sample } from "../entities/environment";
import { Gene } from "../ga/dna";

function createAction(type: BotActionType, data?: any) {
  return { type: type, data: data };
}

function createActions(types: BotActionType[]) {
  return types.map((t) => createAction(t));
}

export function RandomAlgorithm(bot: Bot, canMove: boolean, samples: Sample[], otherBots?: Bot[]): BotAction[] {
  let sample = samples[0];
  if (sample.type === "TRASH") {
    return [createAction(BotActionType.CLEAN)];
  }

  if ( Math.random() > 0.2 && canMove) {
    return [createAction(BotActionType.MOVE)];
  }
  return Math.random() > 0.5 ? [createAction(BotActionType.TURN_RIGHT)] : [createAction(BotActionType.TURN_LEFT)];
}

export function GaAlgorithm(bot: Bot, canMove: boolean, samples: Sample[], otherBots?: Bot[]): BotAction[] {
  if (bot.dna && bot.dna.genes.length) {
    let direction = bot.dna.genes[bot.geneCounter];
    bot.geneCounter = (bot.geneCounter + 1) % bot.dna.genes.length;
    let coords = {x: bot.x, y: bot.y};
    switch(direction) {
      case Gene.UP:
        coords.y--;
        break;
      case Gene.DOWN:
        coords.y++;
        break;
      case Gene.LEFT:
        coords.x--;
        break;
      case Gene.RIGT:
        coords.x++;
        break;
    }

    return [createAction(BotActionType.MOVE_TO, coords)];
  }

  return [];
}

export function BfsAlgorithm(bot: Bot, canMove: boolean, samples: Sample[], otherBots?: Bot[]): BotAction[] {
  let currentPositionSample = samples.find((s) => s.x === bot.x && s.y === bot.y);
  let actions: BotAction[] = []
  if (currentPositionSample && currentPositionSample.type === "TRASH") {
    actions.push(createAction(BotActionType.CLEAN));
  }
  samples.forEach((s) => {
    if ((s.type === 'TRASH' || s.type == 'EMPTY') && 
        !bot.hasInStack({x: s.x, y: s.y}) &&
        !bot.hasVisited({x: s.x, y: s.y})) {
      bot.stack.push({x: s.x, y: s.y});
    }
  });
  if (bot.stack.length) {
    actions.push({type: BotActionType.MOVE_TO, data: bot.stack.shift()});
  }
  return actions;
}

export function DfsAlgorithm(bot: Bot, canMove: boolean, samples: Sample[], otherBots?: Bot[]): BotAction[] {
  let currentPositionSample = samples.find((s) => s.x === bot.x && s.y === bot.y);
  let actions: BotAction[] = []
  if (currentPositionSample && currentPositionSample.type === "TRASH") {
    actions.push(createAction(BotActionType.CLEAN));
  }
  
  samples.forEach((s) => {
    if ((s.type === 'TRASH' || s.type == 'EMPTY') && 
        !bot.hasInStack({x: s.x, y: s.y}) &&
        (otherBots || []).filter((b) => b.hasInStack({x: s.x, y: s.y})).length == 0 &&
        (otherBots || []).filter((b) => b.hasVisited({x: s.x, y: s.y})).length == 0 &&
        !bot.hasVisited({x: s.x, y: s.y})) {
      bot.stack.push({x: s.x, y: s.y});
    }
  });
  if (bot.stack.length) {
    actions.push({type: BotActionType.MOVE_TO, data: bot.stack.pop()});
  }
  return actions;
}

export function FollowWallsAlgorithm(bot: Bot, canMove: boolean, samples: Sample[],  otherBots?: Bot[]): BotAction[] {
  let sample = samples[0];
  if (sample.type === "TRASH") {
    return [ createAction(BotActionType.CLEAN) ];
  }

  if (!bot.memory.get("room_explore")) {
    if (canMove && !bot.hasVisited(bot.calculateNewPosition())) {
      return [ createAction(BotActionType.MOVE) ];
    }

    if (!canMove) {
      if (bot.memory.get("direction") === "right") {
        bot.memory.set("direction", "left");
        return createActions([BotActionType.TURN_LEFT, BotActionType.MOVE, BotActionType.TURN_LEFT]);
      } else {
        bot.memory.set("direction", "right");
        return createActions([BotActionType.TURN_RIGHT, BotActionType.MOVE, BotActionType.TURN_RIGHT]);
      }
    }
    //bot.memory.delete("wall_found");
    bot.memory.set("room_explore", "true");
  } else {
    let wallFound = bot.memory.get("wall_found");
    if (!wallFound && canMove) {
      console.log("looking for wall");
      return [ createAction(BotActionType.MOVE) ];
    }
    if (!canMove) {
      bot.memory.set("wall_found", "true");
    }
  
    let prevAction = bot.getPreviousAction();
    if (BotActionType.MOVE === prevAction?.type) {
      return [ createAction(BotActionType.TURN_LEFT) ];
    }
    if (BotActionType.TURN_LEFT === prevAction?.type && canMove) {
      if (bot.history.length > 4) {
        let prevMoves = bot.history.slice(Math.max(bot.history.length - 5, 0));
        if(prevMoves.filter((a => BotActionType.TURN_LEFT !== a.type)).length == 0) {
          bot.memory.delete("room_explore");
          return createActions([ BotActionType.MOVE, BotActionType.MOVE, BotActionType.MOVE, Math.random() > 0.3 ? BotActionType.TURN_LEFT : BotActionType.TURN_RIGHT ]);
        }
      }
      return [ createAction(BotActionType.TURN_LEFT) ];
    }
  }


  if (canMove) {
    return [ createAction(BotActionType.MOVE)];
  }

  return [createAction(BotActionType.TURN_RIGHT)];

}
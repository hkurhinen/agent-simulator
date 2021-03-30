import React from "react";
import { Layer, Rect, Stage } from "react-konva"
import Environment from "../entities/environment";
import { BotVisualization } from "./BotVisualization";
import { RoomVisualization } from "./RoomVisualization";
import { TrashVisualization } from "./TrashVisualization";


interface Props {
  environment: Environment,
  progress: number
}

export const EnvironmentVisualization: React.FC<Props> = ({ environment }) => {

  let width = environment.size * 10;
  let height = environment.size * 10;
  const grid = [];
  for (let i = 0; i < width; i+= 10) {
    for(let j = 0; j < height; j+= 10 ) {
      grid.push(
        <Rect
          key={`grid-${i}-${j}`}
          stroke="white"
          x={i}
          y={j}
          width={10}
          height={10} />
      )
    }
  }

  return (
    <Stage width={width} height={height}>
      <Layer>
        { grid }
        { environment.rooms.map((r, index) => <RoomVisualization key={`room-${index}`} index={index} entity={r} />) }
        { environment.trash.map((t, index) => <TrashVisualization key={`trash-${index}`} x={t.x * 10} y={t.y * 10} />) }
        { environment.getBots().map((b, index) => <BotVisualization key={`bot-${index}`} bot={b} />) }
      </Layer>
    </Stage>
  );
}
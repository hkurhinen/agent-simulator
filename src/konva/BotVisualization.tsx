import { Line, Rect } from "react-konva";
import Bot from "../entities/bot";


interface Props {
  bot: Bot
}

const translateRotation = (rotation: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
  switch(rotation) {
    case 'UP':
      return 180;
    case 'DOWN':
      return 0;
    case 'LEFT':
      return 90;
    case 'RIGHT':
      return 270;
  }
}

export const BotVisualization: React.FC<Props> = ({bot}) => {
  return (
    <>
      <Line
        offsetX={0}
        offsetY={0}
        strokeWidth={3}
        opacity={0.6}
        points={bot.path.flatMap((c) => [c.x * 10 + 5, c.y * 10 + 5])}
        stroke={bot.color} />
      <Rect 
        offsetX={5}
        offsetY={5}
        rotationDeg={translateRotation(bot.rotation)}
        fill={bot.color}
        stroke={bot.color}
        cornerRadius={[0, 0, 15, 15]} 
        x={bot.x * 10 + 5}
        y={bot.y * 10 + 5} 
        width={10}
        height={10} />
    </>
  );
}
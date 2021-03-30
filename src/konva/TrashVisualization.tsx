import { Circle } from "react-konva"

interface Props {
  x: number,
  y: number
}

export const TrashVisualization: React.FC<Props> = ({x, y}) => {

  return (
    <Circle radius={5} x={x + 5} y={y + 5} fill="black" />
  );
}
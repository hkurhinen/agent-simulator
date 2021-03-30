import { Rect } from "react-konva"
import Room from "../entities/room";

interface Props {
  index: number,
  entity: Room
}

export const RoomVisualization: React.FC<Props> = ({index, entity}) => {

  const rects = entity.getBlocks().map(b => {
    return <Rect 
      key={`room-${index}-${b.x}-${b.y}`}
      x={b.x * 10} y={b.y * 10}
      width={10}
      height={10}
      fill="black" />
  })

  return (
    <>
      {rects}
    </>
  );
}
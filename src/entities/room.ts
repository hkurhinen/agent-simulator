interface Props {
  width: number,
  height: number,
  x: number,
  y: number
  doors?: { x: number, y: number }[]
}

interface Block {
  x: number,
  y: number
}

export default class Room {

  private width: number;
  private height: number;
  private x: number;
  private y: number;
  private doors?: { x: number, y: number }[];

  constructor({width, height, x, y, doors}: Props) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.doors = doors;
  }

  collidesWith(x: number, y: number): boolean {
    const blocks = this.getBlocks();
    const collision = blocks.find(b => b.x === x && b.y === y);
    return !!collision;
  }

  getBlocks(): Block[] {
    const doorLocations = this.doors || [];
    const blocks = [];
    const startX = this.x;
    const endX = this.x + this.width;
    const startY = this.y;
    const endY = this.y + this.height;
    for (let i = this.x; i < endX; i++) {
      const hasDoorUp = doorLocations.find(d => d.x === i && d.y === startY);
      if (!hasDoorUp) {
        blocks.push({ x: i, y: startY });
      }
      const hasDoorDown = doorLocations.find(d => d.x === i && d.y === endY);
      if (!hasDoorDown) {
        blocks.push({ x: i, y: endY });
      }
    }
  
    for (let j = this.y + 1; j < endY; j++) {
      const hasDoorLeft = doorLocations.find(d => d.x === startX && d.y === j);
      if (!hasDoorLeft) {
        blocks.push({ x: startX, y:j });
      }
      const hasDoorRight = doorLocations.find(d => d.x === endX - 1 && d.y === j);
      if (!hasDoorRight) {
        blocks.push({ x: endX - 1, y: j });
      }
    }
    return blocks;
  }

}
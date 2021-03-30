export default class Trash {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  collidesWith(x: number, y: number): boolean {
    return this.x === x && this.y === y
  }

}
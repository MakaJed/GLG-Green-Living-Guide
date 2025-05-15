// classes/Boundary.ts
export class Boundary {
  static readonly width  = 48;
  static readonly height = 48;

  position: { x: number; y: number };
  width: number;
  height: number;

  constructor(position: { x: number; y: number }) {
    this.position = position;
    this.width  = Boundary.width;
    this.height = Boundary.height;
  }
}

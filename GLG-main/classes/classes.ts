// classes/classes.ts
import { CanvasRenderingContext2D as RNContext } from 'react-native-canvas';

export class Boundary {
  position: { x: number; y: number };
  width = 48;
  height = 48;

  constructor(opts: { position: { x: number; y: number } }) {
    this.position = opts.position;
  }

  // Accept the RN Canvas context type
  draw(ctx: RNContext, offset: { x: number; y: number }) {
    ctx.beginPath();
    ctx.rect(
      this.position.x + offset.x,
      this.position.y + offset.y,
      this.width,
      this.height
    );
    ctx.strokeStyle = 'red';
    ctx.stroke();
  }
}

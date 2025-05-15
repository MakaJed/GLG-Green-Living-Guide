export interface Position {
  x: number;
  y: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameEntity {
  id: string;
  position: Position;
  bounds: Bounds;
} 
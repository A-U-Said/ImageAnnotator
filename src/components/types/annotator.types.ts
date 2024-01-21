export type BaseRegion = {
  id: string | number,
  cls?: string,
  locked?: boolean,
  visible?: boolean,
  color: string,
  editingLabels?: boolean,
  highlighted?: boolean,
  tags?: Array<string>,
}

export type Point = BaseRegion & {
  type: "point",
  x: number,
  y: number,
}

export type Box = BaseRegion & {
  type: "box",
  x: number,
  y: number,
  w: number,
  h: number,
}

export type Region = Point | Box;

export type AnnotationImage = {
  src: string,
  thumbnailSrc?: string,
  name: string,
  regions?: Region[],
  pixelSize?: { w: number, h: number },
  realSize?: { w: number, h: number, unitName: string },
  frameTime?: number,
}
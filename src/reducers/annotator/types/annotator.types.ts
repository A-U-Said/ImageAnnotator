
export type ToolEnum =
  | "select"
  | "pan"
  | "zoom"
  | "create-point"
  | "create-box";

export type HeaderItemEnum =
  | "previous"
  | "next"
  | "save";

  export type Mode =
  | null
  | Mode_ResizeBox
  | Mode_MoveRegion;

export type Mode_ResizeBox = {
  mode: "RESIZE_BOX",
  editLabelEditorAfter?: boolean,
  regionId: string | number,
  freedom: [number, number],
  original: { x: number, y: number, w: number, h: number },
  isNew?: boolean,
}

export type Mode_MoveRegion = {
  mode: "MOVE_REGION", 
  regionId: string 
}
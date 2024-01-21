
export type ToolEnum =
  | "select"
  | "pan"
  | "zoom"
  | "create-point"
  | "create-box"

  export type Mode =
  | null
  | { mode: "DRAW_POLYGON", regionId: string }
  | { mode: "MOVE_POLYGON_POINT", regionId: string, pointIndex: number }
  | {
      mode: "RESIZE_BOX",
      editLabelEditorAfter?: boolean,
      regionId: string | number,
      freedom: [number, number],
      original: { x: number, y: number, w: number, h: number },
      isNew?: boolean,
    }
  | { mode: "MOVE_REGION", regionId: string }
  | { mode: "MOVE_KEYPOINT", regionId: string, keypointId: string }
  | {
      mode: "RESIZE_KEYPOINTS",
      centerX: number,
      centerY: number,
      regionId: string,
      isNew: boolean,
    }
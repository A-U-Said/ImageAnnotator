import { Region } from "components/types/annotator.types"

export const getEnclosingBox = (region: Region) => {
  switch (region.type) {
    case "box": {
      return { x: region.x, y: region.y, w: region.w, h: region.h }
    }
    case "point": {
      return { x: region.x, y: region.y, w: 0, h: 0 }
    }
    default: {
      return { x: 0, y: 0, w: 0, h: 0 }
    }
  }
}
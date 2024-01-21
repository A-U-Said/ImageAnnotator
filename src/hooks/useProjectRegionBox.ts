import useEventCallback from "./useEventCallback"
import { getEnclosingBox } from "regionTools"
import Matrix from "matrix"
import { LayoutParams } from "components/types/imageCanvas.types"
import { Region } from "components/types/annotator.types"

const useProjectRegionBox = ({ layoutParams, mat } : { layoutParams: React.MutableRefObject<LayoutParams>, mat: Matrix }) => {

  return useEventCallback((r: Region) => {
    const { iw, ih } = layoutParams.current
    const bbox = getEnclosingBox(r)
    const margin = r.type === "point" ? 15 : 2
    const cbox = {
      x: bbox.x * iw - margin,
      y: bbox.y * ih - margin,
      w: bbox.w * iw + margin * 2,
      h: bbox.h * ih + margin * 2,
    }
    const pbox = {
      ...mat.clone().inverse().applyToPoint(cbox.x, cbox.y),
      w: cbox.w / mat.a,
      h: cbox.h / mat.d,
    }
    return pbox
  })
}

export default useProjectRegionBox;
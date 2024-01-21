import styled from "styled-components"
import React, {
  useRef,
  useState,
  useLayoutEffect,
  useEffect,
  useMemo,
} from "react"
import useWindowSize from "hooks/useWindowSize"
import useMouse from "hooks/useMouse"
import useRafState from "hooks/useRafState"
import useEventCallback from "hooks/useEventCallback"

import Matrix from "../matrix"
import { Region } from "./types/annotator.types"
import useProjectRegionBox from "hooks/useProjectRegionBox"
import ImageCanvasBackground from "./ImageCanvasBackground"
import PreventScrollToParents from "./PreventScrollToParents"
import RegionShapes from "./RegionShapes"
import RegionLabel from "./RegionLabel"
import RegionSelectAndTransformBoxes from "./RegionSelectAndTransformBoxes"
import { LayoutParams } from "./types/imageCanvas.types"


const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  z-index: 1;
  position: relative;
  opacity: 0.25;
`

const ZoomPercentage = styled.div`
  color: #fff;
  right: 0;
  bottom: 16px;
  opacity: 0.5;
  padding: 4px;
  position: absolute;
  font-size: 14px;
  font-weight: bolder;
  background-color: rgba(0,0,0,0.4);
`

const AnnotationContainer = styled.div`
  top: 10px;
  left: 10px;
  opacity: 0.5;
  z-index: 10;
  position: absolute;
  transition: opacity 500ms;
`


const getDefaultMat = () => {
  let mat = Matrix.from(1, 0, 0, 1, -10, -10);
  return mat;
}

interface IImageCanvasProps {
  regions: Array<Region>;
  imageSrc?: string;
  onMouseMove?: ({ x, y } : { x: number, y: number }) => void;
  onMouseDown?: ({ x, y } : { x: number, y: number }) => void;
  onMouseUp?: ({ x, y } : { x: number, y: number }) => void;
  dragWithPrimary?: boolean;
  zoomWithPrimary?: boolean;
  createWithPrimary?: boolean;
  regionClsList?: Array<string>;
  regionTagList?: Array<string>;
  onImageOrVideoLoaded: (
    { naturalWidth, naturalHeight, duration } :
    { naturalWidth: number, naturalHeight: number, duration?: number }
  ) => void;
  onChangeRegion: (region: Region) => void;
  onBeginBoxTransform: (box: Region, point: [number, number]) => void;
  onSelectRegion: (region: Region) => void;
  onBeginMovePoint: (point: Region) => void;
  onDeleteRegion: (region: Region) => void;
}


const ImageCanvas: React.FC<IImageCanvasProps> = ({
  regions,
  imageSrc,
  onMouseMove = () => null,
  onMouseDown = () => null,
  onMouseUp = () => null,
  dragWithPrimary = false,
  zoomWithPrimary = false,
  createWithPrimary = false,
  regionClsList,
  regionTagList,
  onImageOrVideoLoaded,
  onChangeRegion,
  onBeginBoxTransform,
  onSelectRegion,
  onBeginMovePoint,
  onDeleteRegion
}) => {

  const canvasEl = useRef<HTMLCanvasElement>(null);
  const layoutParams = useRef<LayoutParams>();
  const [dragging, changeDragging] = useRafState(false);
  const [zoomStart, changeZoomStart] = useRafState(null);
  const [zoomEnd, changeZoomEnd] = useRafState(null);
  const [mat, changeMat] = useRafState<Matrix>(getDefaultMat());
  const windowSize = useWindowSize()

  const { mouseEvents } = useMouse({
    canvasEl: canvasEl,
    dragging: dragging,
    mat: mat,
    layoutParams: layoutParams,
    changeMat: changeMat,
    zoomStart: zoomStart,
    zoomEnd: zoomEnd,
    changeZoomStart: changeZoomStart,
    changeZoomEnd: changeZoomEnd,
    changeDragging: changeDragging,
    zoomWithPrimary: zoomWithPrimary,
    dragWithPrimary: dragWithPrimary,
    onMouseMove: onMouseMove,
    onMouseDown: onMouseDown,
    onMouseUp: onMouseUp,
  })

  useLayoutEffect(() => {
    changeMat(mat.clone())
  }, [changeMat, mat, windowSize])

  const projectRegionBox = useProjectRegionBox({ layoutParams, mat })

  const [imageDimensions, changeImageDimensions] = useState<{ naturalWidth: number, naturalHeight: number}>()
  const imageLoaded = Boolean(imageDimensions && imageDimensions.naturalWidth)

  const onVideoOrImageLoaded = useEventCallback(
    ({ naturalWidth, naturalHeight, duration }) => {
      const dims = { naturalWidth, naturalHeight, duration }
      if (onImageOrVideoLoaded) {
        onImageOrVideoLoaded(dims)
      }
      changeImageDimensions(dims)
      setTimeout(() => changeImageDimensions(dims), 10)
    }
  )

  const canvas = canvasEl.current
  if (canvas && imageLoaded) {
    const { clientWidth, clientHeight } = canvas

    const fitScale = Math.max(
      imageDimensions.naturalWidth / (clientWidth - 20),
      imageDimensions.naturalHeight / (clientHeight - 20)
    )

    const [iw, ih] = [
      imageDimensions.naturalWidth / fitScale,
      imageDimensions.naturalHeight / fitScale,
    ]

    layoutParams.current = {
      iw,
      ih,
      fitScale,
      canvasWidth: clientWidth,
      canvasHeight: clientHeight,
    }
  }

  useEffect(() => {
    if (!imageLoaded) return
    changeMat(
      getDefaultMat()
    )
    // eslint-disable-next-line
  }, [imageLoaded])

  useLayoutEffect(() => {
    if (!imageDimensions) return
    const { clientWidth, clientHeight } = canvas
    canvas.width = clientWidth
    canvas.height = clientHeight
    const context = canvas.getContext("2d")

    context.save()
    //@ts-ignore
    context.transform(...mat.clone().inverse().toArray())
    context.restore()
  })

  const { iw, ih } = layoutParams.current || {}

  let zoomBox =
    !zoomStart || !zoomEnd
      ? null
      : {
          ...mat.clone().inverse().applyToPoint(zoomStart.x, zoomStart.y),
          w: (zoomEnd.x - zoomStart.x) / mat.a,
          h: (zoomEnd.y - zoomStart.y) / mat.d,
        }
  if (zoomBox) {
    if (zoomBox.w < 0) {
      zoomBox.x += zoomBox.w
      zoomBox.w *= -1
    }
    if (zoomBox.h < 0) {
      zoomBox.y += zoomBox.h
      zoomBox.h *= -1
    }
  }


  const imagePosition = {
    topLeft: mat.clone().inverse().applyToPoint(0, 0),
    bottomRight: mat.clone().inverse().applyToPoint(iw, ih),
  }

  const highlightedRegion = useMemo(() => {
    const highlightedRegions = regions.filter((r) => r.highlighted)
    if (highlightedRegions.length !== 1) return null
    return highlightedRegions[0]
  }, [regions])

  return (
    <>
    <div
        style={{
          width: "100%",
          height: "100%",
          maxHeight: "calc(100vh - 68px)",
          position: "relative",
          overflow: "hidden",
          cursor: createWithPrimary
            ? "crosshair"
            : dragging
            ? "grabbing"
            : dragWithPrimary
            ? "grab"
            : zoomWithPrimary
            ? mat.a < 1
              ? "zoom-out"
              : "zoom-in"
            : undefined,
        }}
      >

        { imageLoaded && !dragging && (
          <RegionSelectAndTransformBoxes
            key="regionSelectAndTransformBoxes"
            regions={regions}
            mouseEvents={mouseEvents}
            projectRegionBox={projectRegionBox}
            dragWithPrimary={dragWithPrimary}
            createWithPrimary={createWithPrimary}
            zoomWithPrimary={zoomWithPrimary}
            onBeginMovePoint={onBeginMovePoint}
            onSelectRegion={onSelectRegion}
            layoutParams={layoutParams}
            mat={mat}
            onBeginBoxTransform={onBeginBoxTransform}
          />
        )}

        { highlightedRegion && (
          <AnnotationContainer>
            <RegionLabel
              allowedClasses={regionClsList}
              allowedTags={regionTagList}
              onChange={onChangeRegion}
              onDelete={onDeleteRegion}
              editing
              region={highlightedRegion}
            />
          </AnnotationContainer>
        )}

        <PreventScrollToParents
          onMouseMove={mouseEvents.onMouseMove}
          onMouseDown={mouseEvents.onMouseDown}
          onMouseUp={mouseEvents.onMouseUp}
          onWheel={mouseEvents.onWheel}
          onContextMenu={mouseEvents.onContextMenu}
          style={{ width: "100%", height: "100%" }}
        >
          <Canvas
            ref={canvasEl}
          />
          <RegionShapes
            imagePosition={imagePosition}
            regions={regions}
          />
          <ImageCanvasBackground
            imagePosition={imagePosition}
            mouseEvents={mouseEvents}
            onLoad={onVideoOrImageLoaded}
            imageSrc={imageSrc}
          />
        </PreventScrollToParents>

        <ZoomPercentage>
          {((1 / mat.a) * 100).toFixed(0)}%
        </ZoomPercentage>

      </div>
    </>
  )
}

export default ImageCanvas

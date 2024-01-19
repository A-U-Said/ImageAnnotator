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
import { KeypointsDefinition, Region } from "./types/annotator.types"
import useProjectRegionBox from "hooks/useProjectRegionBox"
import ImageCanvasBackground from "./ImageCanvasBackground"
import PreventScrollToParents from "./PreventScrollToParents"
import RegionShapes from "./RegionShapes"
import RegionLabel from "./RegionLabel"
import RegionSelectAndTransformBoxes from "./RegionSelectAndTransformBoxes"


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


const getDefaultMat = (allowedArea: { x: number, y: number, w: number, h: number } = null, 
  { iw, ih } : { iw: number, ih: number } = { iw: null, ih: null}) => {
    let mat = Matrix.from(1, 0, 0, 1, -10, -10)
    if (allowedArea && iw) {
      mat = mat
        .translate(allowedArea.x * iw, allowedArea.y * ih)
        .scaleU(allowedArea.w + 0.05)
    }
    return mat
  }

interface IImageCanvasProps {
  regions: Array<Region>
  imageSrc?: string,
  keypointDefinitions?: KeypointsDefinition,
  onMouseMove?: ({ x, y } : { x: number, y: number }) => any,
  onMouseDown?: ({ x, y } : { x: number, y: number }) => any,
  onMouseUp?: ({ x, y } : { x: number, y: number }) => any,
  dragWithPrimary?: boolean,
  zoomWithPrimary?: boolean,
  createWithPrimary?: boolean,
  regionClsList?: Array<string>,
  regionTagList?: Array<string>,
  showHighlightBox?: boolean,
  allowedArea?: { x: number, y: number, w: number, h: number },
  onImageOrVideoLoaded: (
    { naturalWidth, naturalHeight, duration } :
    { naturalWidth: number, naturalHeight: number, duration?: number }
  ) => any,
  onChangeRegion: (Region: any) => any,
  onBeginBoxTransform: (box: Region, point: [number, number]) => any,
  onBeginMovePolygonPoint: (polygon: Region, index: number) => any,
  onBeginMoveKeypoint: (keypoints: Region, index: number) => any,
  onAddPolygonPoint: (polygon: Region, point: [number, number], index: number) => any,
  onSelectRegion: (region: Region) => any,
  onBeginMovePoint: (point: Region) => any,
  onDeleteRegion: (region: Region) => any,
  zoomOnAllowedArea?: boolean,
}


const ImageCanvas: React.FC<IImageCanvasProps> = ({
  regions,
  imageSrc,
  keypointDefinitions,
  onMouseMove = (p) => null,
  onMouseDown = (p) => null,
  onMouseUp = (p) => null,
  dragWithPrimary = false,
  zoomWithPrimary = false,
  createWithPrimary = false,
  regionClsList,
  regionTagList,
  showHighlightBox = true,
  allowedArea,
  onImageOrVideoLoaded,
  onChangeRegion,
  onBeginBoxTransform,
  onBeginMovePolygonPoint,
  onAddPolygonPoint,
  onBeginMoveKeypoint,
  onSelectRegion,
  onBeginMovePoint,
  onDeleteRegion,
  zoomOnAllowedArea = true,
}) => {

  const canvasEl = useRef<HTMLCanvasElement>(null)
  const layoutParams = useRef<{
    iw: number,
    ih: number,
    fitScale: number,
    canvasWidth: number,
    canvasHeight: number,
  }>()
  const [dragging, changeDragging] = useRafState(false)
  const [zoomStart, changeZoomStart] = useRafState(null)
  const [zoomEnd, changeZoomEnd] = useRafState(null)
  const [mat, changeMat] = useRafState(getDefaultMat())
  const windowSize = useWindowSize()

  const { mouseEvents } = useMouse({
    canvasEl,
    dragging,
    mat,
    layoutParams,
    changeMat,
    zoomStart,
    zoomEnd,
    changeZoomStart,
    changeZoomEnd,
    changeDragging,
    zoomWithPrimary,
    dragWithPrimary,
    onMouseMove,
    onMouseDown,
    onMouseUp,
  })

  useLayoutEffect(() => {
    changeMat(mat.clone())
  }, [windowSize])

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
      getDefaultMat(
        zoomOnAllowedArea ? allowedArea : null,
        layoutParams.current
      )
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

    const { iw, ih } = layoutParams.current

    if (allowedArea) {
      // Pattern to indicate the NOT allowed areas
      const { x, y, w, h } = allowedArea
      context.save()
      context.globalAlpha = 1
      const outer: [number, number][] = [
        [0, 0],
        [iw, 0],
        [iw, ih],
        [0, ih],
      ]
      const inner: [number, number][] = [
        [x * iw, y * ih],
        [x * iw + w * iw, y * ih],
        [x * iw + w * iw, y * ih + h * ih],
        [x * iw, y * ih + h * ih],
      ]
      context.moveTo(...outer[0])
      outer.forEach((p) => context.lineTo(...p))
      context.lineTo(...outer[0])
      context.closePath()

      inner.reverse()
      context.moveTo(...inner[0])
      inner.forEach((p) => context.lineTo(...p))
      context.lineTo(...inner[0])

      context.fillStyle = "#f00"
      context.fill()

      context.restore()
    }

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
            regions={
              !allowedArea
                ? regions
                : [
                    {
                      type: "box",
                      id: "$$allowed_area",
                      cls: "allowed_area",
                      highlighted: true,
                      x: allowedArea.x,
                      y: allowedArea.y,
                      w: allowedArea.w,
                      h: allowedArea.h,
                      visible: true,
                      color: "#ff0",
                    },
                  ]
            }
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
            onBeginMovePolygonPoint={onBeginMovePolygonPoint}
            onBeginMoveKeypoint={onBeginMoveKeypoint}
            onAddPolygonPoint={onAddPolygonPoint}
            showHighlightBox={showHighlightBox}
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
              allowComments={false}
            />
          </AnnotationContainer>
        )}

        <PreventScrollToParents
          style={{ width: "100%", height: "100%" }}
          {...mouseEvents}
        >
          <Canvas
            ref={canvasEl}
          />
          <RegionShapes
            mat={mat}
            keypointDefinitions={keypointDefinitions}
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

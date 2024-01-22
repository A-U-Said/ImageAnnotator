import React, { Fragment, memo } from "react"
import HighlightBox from "./HighlightBox"
import PreventScrollToParents from "./PreventScrollToParents"
import styled from "styled-components"
import { Region } from "./types/annotator.types"
import { MouseEvents } from "hooks/useMouse"
import Matrix from "matrix"

const TransformGrabber = styled.div<{ regioncolor: string}>`
  width: 8px;
  height: 8px;
  z-index: 2;
  border: 2px solid ${props => props.regioncolor || "black"};
  position: absolute;
`

const boxCursorMap = [
  ["nw-resize", "n-resize", "ne-resize"],
  ["w-resize", "grab", "e-resize"],
  ["sw-resize", "s-resize", "se-resize"],
]

interface IRegionSelectAndTransformBoxProps {
  region: Region;
  mouseEvents: MouseEvents;
  projectRegionBox: (r: Region) => {
    w: number;
    h: number;
    x: number;
    y: number;
  }
  dragWithPrimary: boolean;
  createWithPrimary: boolean;
  zoomWithPrimary: boolean;
  onBeginMovePoint: (point: Region) => void;
  onSelectRegion: (region: Region) => void;
  mat: Matrix;
  onBeginBoxTransform: (box: Region, point: [number, number]) => void;
}


const RegionSelectAndTransformBox: React.FC<IRegionSelectAndTransformBoxProps> = ({
    region: r,
    mouseEvents,
    projectRegionBox,
    dragWithPrimary,
    createWithPrimary,
    zoomWithPrimary,
    onBeginMovePoint,
    onSelectRegion,
    mat,
    onBeginBoxTransform,
  }) => {

    const pbox = projectRegionBox(r)
    return (
        <Fragment>
          <PreventScrollToParents>
            <HighlightBox
              region={r}
              mouseEvents={mouseEvents}
              dragWithPrimary={dragWithPrimary}
              createWithPrimary={createWithPrimary}
              zoomWithPrimary={zoomWithPrimary}
              onBeginMovePoint={onBeginMovePoint}
              onSelectRegion={onSelectRegion}
              pbox={pbox}
            />
            {r.type === "box" &&
              !dragWithPrimary &&
              !zoomWithPrimary &&
              !r.locked &&
              r.highlighted &&
              mat.a < 1.2 &&
              [
                [0, 0],
                [0.5, 0],
                [1, 0],
                [1, 0.5],
                [1, 1],
                [0.5, 1],
                [0, 1],
                [0, 0.5],
                [0.5, 0.5],
              ].map(([px, py], index) => (
                <TransformGrabber
                  key={index}
                  regioncolor={r.color}
                  onMouseUp={mouseEvents.onMouseUp}
                  onWheel={mouseEvents.onWheel}
                  onContextMenu={mouseEvents.onContextMenu}
                  onMouseMove={mouseEvents.onMouseMove}
                  onMouseDown={(e) => {
                    if (e.button === 0) {
                      return onBeginBoxTransform(r, [px * 2 - 1, py * 2 - 1]);
                    }
                    mouseEvents.onMouseDown(e);
                  }}
                  style={{
                    left: pbox.x - 4 - 2 + pbox.w * px,
                    top: pbox.y - 4 - 2 + pbox.h * py,
                    cursor: boxCursorMap[py * 2][px * 2],
                    borderRadius: px === 0.5 && py === 0.5 ? 4 : undefined,
                  }}
                />
              ))}
          </PreventScrollToParents>
        </Fragment>
    )
}

interface IRegionSelectAndTransformBoxesProps extends IRegionSelectAndTransformBoxProps {
  regions: Array<Region>;
}
type RegionSelectAndTransformBoxesProps = Omit<IRegionSelectAndTransformBoxesProps, "region">;

const RegionSelectAndTransformBoxes = memo<RegionSelectAndTransformBoxesProps>(
  (props) => {
    return (
      <>
        { props.regions
        .filter((r) => r.visible || r.visible === undefined)
        .filter((r) => !r.locked)
        .map((r, index) => {
          return <RegionSelectAndTransformBox key={index} {...props} region={r} />
        })}
      </>
    )
  },
  (n, p) => n.regions === p.regions && n.mat === p.mat
)

export default RegionSelectAndTransformBoxes
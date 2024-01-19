// @flow

import React from "react"
import styled, { keyframes } from "styled-components"


const borderDance = keyframes`
  from {
    stroke-dashoffset: 0;
  }

  to {
    stroke-dashoffset: 100;
  }
`;

const HighlightBoxWrapper = styled.svg<{ higgyliggy: boolean }>`
    z-index: 2;
    transition: opacity 500ms;
    
    ${props => props.higgyliggy && `
      z-index: 3;
    `}

    ${props => !props.higgyliggy && `
      opacity: 0;
      &:hover {
        opacity: 0.6;
      }
    `}

    path {
      vector-effect: non-scaling-stroke;
      stroke-width: 2;
      stroke: red;
      fill: none;
      stroke-dasharray: 5;
      animation-name: ${borderDance};
      animation-duration: 4s;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
      animation-play-state: running;
    },
  },
`


export const HighlightBox = ({
  mouseEvents,
  dragWithPrimary,
  zoomWithPrimary,
  createWithPrimary,
  onBeginMovePoint,
  onSelectRegion,
  region: r,
  pbox,
}: {
  mouseEvents: any,
  dragWithPrimary: boolean,
  zoomWithPrimary: boolean,
  createWithPrimary: boolean,
  onBeginMovePoint: Function,
  onSelectRegion: Function,
  region: any,
  pbox: { x: number, y: number, w: number, h: number },
}) => {

  if (!pbox.w || pbox.w === Infinity) return null
  if (!pbox.h || pbox.h === Infinity) return null
  if (r.unfinished) return null

  const styleCoords =
    r.type === "point"
      ? {
          left: pbox.x + pbox.w / 2 - 30,
          top: pbox.y + pbox.h / 2 - 30,
          width: 60,
          height: 60,
        }
      : {
          left: pbox.x - 5,
          top: pbox.y - 5,
          width: pbox.w + 10,
          height: pbox.h + 10,
        }

  const pathD =
    r.type === "point"
      ? `M5,5 L${styleCoords.width - 5} 5L${styleCoords.width - 5} ${
          styleCoords.height - 5
        }L5 ${styleCoords.height - 5}Z`
      : `M5,5 L${pbox.w + 5},5 L${pbox.w + 5},${pbox.h + 5} L5,${pbox.h + 5} Z`

  return (
      <HighlightBoxWrapper
        key={r.id}
        higgyliggy={r.highlighted}
        onMouseUp={mouseEvents.onMouseUp}
        onWheel={mouseEvents.onWheel}
        onContextMenu={mouseEvents.onContextMenu}
        onMouseMove={mouseEvents.onMouseMove}
        onMouseLeave={mouseEvents.onMouseLeave}
        {...(!zoomWithPrimary && !dragWithPrimary
          ? {
              onMouseDown: (e) => {
                if (
                  !r.locked &&
                  r.type === "point" &&
                  r.highlighted &&
                  e.button === 0
                ) {
                  return onBeginMovePoint(r)
                }
                if (e.button === 0 && !createWithPrimary)
                  return onSelectRegion(r)
                mouseEvents.onMouseDown(e)
              },
            }
          : {})}
        style={{
          ...(r.highlighted
            ? {
                pointerEvents: r.type !== "point" ? "none" : undefined,
                cursor: "grab",
              }
            : {
                cursor: !(
                  zoomWithPrimary ||
                  dragWithPrimary ||
                  createWithPrimary
                )
                  ? "pointer"
                  : undefined,
                pointerEvents:
                  zoomWithPrimary ||
                  dragWithPrimary ||
                  (createWithPrimary && !r.highlighted)
                    ? "none"
                    : undefined,
              }),
          position: "absolute",
          ...styleCoords,
        }}
      >
        <path d={pathD} />
      </HighlightBoxWrapper>
  )
}

export default HighlightBox

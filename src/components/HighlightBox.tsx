// @flow

import React from "react"
import styled, { keyframes } from "styled-components"
import { Region } from "./types/annotator.types";
import { MouseEvents } from "hooks/useMouse";


const borderDance = keyframes`
  from {
    stroke-dashoffset: 0;
  }

  to {
    stroke-dashoffset: 100;
  }
`;

const HighlightBoxWrapper = styled.svg<{ ishighlighted: boolean, regioncolor: string }>`
    z-index: 2;
    transition: opacity 500ms;
    
    ${props => props.ishighlighted && `
      z-index: 3;
    `}

    ${props => !props.ishighlighted && `
      opacity: 0;
      &:hover {
        opacity: 0.6;
      }
    `}

    path {
      vector-effect: non-scaling-stroke;
      stroke-width: 2;
      stroke: ${props => props.regioncolor || "black"};
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


interface IHighlightBoxProps {
  mouseEvents: MouseEvents;
  dragWithPrimary: boolean;
  zoomWithPrimary: boolean;
  createWithPrimary: boolean;
  onBeginMovePoint: (point: Region) => void;
  onSelectRegion: (region: Region) => void;
  region: Region;
  pbox: { x: number, y: number, w: number, h: number };
}


const HighlightBox: React.FC<IHighlightBoxProps> = ({
  mouseEvents,
  dragWithPrimary,
  zoomWithPrimary,
  createWithPrimary,
  onBeginMovePoint,
  onSelectRegion,
  region: r,
  pbox,
}) => {

  if (!pbox.w || pbox.w === Infinity) {
    return null;
  }
  if (!pbox.h || pbox.h === Infinity) {
    return null;
  }

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
      : `M5,5 L${pbox.w + 5},5 L${pbox.w + 5},${pbox.h + 5} L5,${pbox.h + 5} Z`;

  return (
      <HighlightBoxWrapper
        ishighlighted={r.highlighted}
        regioncolor={r.color}
        onMouseUp={mouseEvents.onMouseUp}
        onWheel={mouseEvents.onWheel}
        onContextMenu={mouseEvents.onContextMenu}
        onMouseMove={mouseEvents.onMouseMove}
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

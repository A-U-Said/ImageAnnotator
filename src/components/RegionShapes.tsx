import React, { memo } from "react"
import { Box, Region } from "./types/annotator.types";
import { colors } from "utils";


interface IRegionShapesProps {
  imagePosition: {
    topLeft: {
        x: number;
        y: number;
    };
    bottomRight: {
        x: number;
        y: number;
    };
  }
  regions: Region[],
}


const RegionShapes: React.FC<IRegionShapesProps> = ({
  imagePosition,
  regions = []
}) => {

  const iw = imagePosition.bottomRight.x - imagePosition.topLeft.x
  const ih = imagePosition.bottomRight.y - imagePosition.topLeft.y

  if (isNaN(iw) || isNaN(ih)) {
    return null
  }

  return (
    <svg
      width={iw}
      height={ih}
      style={{
        position: "absolute",
        zIndex: 2,
        left: imagePosition.topLeft.x,
        top: imagePosition.topLeft.y,
        pointerEvents: "none",
        width: iw,
        height: ih,
      }}
    >
      <WrappedRegionList
        regions={regions}
        iw={iw}
        ih={ih}
      />
    </svg>
  )
}


const WrappedRegionList = memo(
  ({ regions, iw, ih } : { regions: Region[], iw: number, ih: number }) => {
    return (
      <>
        { regions
        .filter((r) => r.visible !== false)
        .map((r, index) => {
          const Component = RegionComponents[r.type]
          return (
            <Component
              key={index}
              region={r}
              iw={iw}
              ih={ih}
            />
          )
        })
      }
    </>
    )
  },
  (n, p) => n.regions === p.regions && n.iw === p.iw && n.ih === p.ih
)


const RegionComponents = {
  point: memo(({ region, iw, ih } : { region: Region, iw: number, ih: number }) => (
    <g transform={`translate(${region.x * iw} ${region.y * ih})`}>
      <path
        d={"M0 8L8 0L0 -8L-8 0Z"}
        strokeWidth={2}
        stroke={region.color}
        fill="transparent"
      />
    </g>
  )),
  box: memo(({ region, iw, ih } : { region: Region, iw: number, ih: number }) => (
    <g transform={`translate(${region.x * iw} ${region.y * ih})`}>
      <rect
        strokeWidth={2}
        x={0}
        y={0}
        width={Math.max((region as Box).w * iw, 0)}
        height={Math.max((region as Box).h * ih, 0)}
        stroke={colors.ensureRgba(region.color, 0.75)}
        fill={colors.ensureRgba(region.color, 0.25)}
      />
    </g>
  ))
}

export default RegionShapes

// @flow weak

import React, { useRef, useMemo, useState, SyntheticEvent } from "react"
import styled from "styled-components"
import useEventCallback from "hooks/useEventCallback"
import { MouseEvents } from "hooks/useMouse"


const StyledImage = styled.img`
  zIndex: 0;
  position: absolute;
`


const Error = styled.div`
  zIndex: 0;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  backgroundColor: rgba(255,0,0,0.2);
  color: #ff0000;
  fontWeight: bold;
  whiteSpace: pre-wrap;
  padding: 50;
`


interface IImageCanvasBackgroundProps {
  imagePosition: {
    topLeft: {
        x: number;
        y: number;
    };
    bottomRight: {
        x: number;
        y: number;
    };
  },
  mouseEvents: MouseEvents,
  imageSrc: string;
  onLoad: (params: { naturalWidth: number, naturalHeight: number, imageElm: EventTarget & HTMLImageElement }) => void,
  useCrossOrigin?: boolean;
}


const ImageCanvasBackground: React.FC<IImageCanvasBackgroundProps> = ({
  imagePosition,
  mouseEvents,
  imageSrc,
  onLoad,
  useCrossOrigin = false,
}) => {

  const imageRef = useRef()
  const [error, setError] = useState<string>()

  const onImageLoaded = useEventCallback((event: SyntheticEvent<HTMLImageElement>) => {
    const imageElm = event.currentTarget;
    if (onLoad)
      onLoad({
        naturalWidth: imageElm.naturalWidth,
        naturalHeight: imageElm.naturalHeight,
        imageElm: imageElm,
      })
  })
  const onImageError = useEventCallback((event: SyntheticEvent<HTMLImageElement>) => {
    setError(
      `Could not load image\n\nMake sure your image works by visiting ${
        imageSrc
      } in a web browser. If that URL works, the server hosting the URL may be not allowing you to access the image from your current domain. Adjust server settings to enable the image to be viewed.${
        !useCrossOrigin
          ? ""
          : `\n\nYour image may be blocked because it's not being sent with CORs headers. To do pixel segmentation, browser web security requires CORs headers in order for the algorithm to read the pixel data from the image. CORs headers are easy to add if you're using an S3 bucket or own the server hosting your images.`
      }\n\n If you need a hand, reach out to the community at universaldatatool.slack.com`
    )
  })

  const stylePosition : React.CSSProperties = useMemo(() => {
    let width = imagePosition.bottomRight.x - imagePosition.topLeft.x
    let height = imagePosition.bottomRight.y - imagePosition.topLeft.y
    return {
      imageRendering: "pixelated",
      left: imagePosition.topLeft.x,
      top: imagePosition.topLeft.y,
      width: isNaN(width) ? 0 : width,
      height: isNaN(height) ? 0 : height,
    }
  }, [
    imagePosition.topLeft.x,
    imagePosition.topLeft.y,
    imagePosition.bottomRight.x,
    imagePosition.bottomRight.y,
  ])

  if (!imageSrc) {
    return <Error>No imageSrc provided</Error>
  }

  if (error) {
    return <Error>{error}</Error>
  }

  return (
    <>
      <StyledImage
        {...mouseEvents}
        src={imageSrc}
        ref={imageRef}
        style={stylePosition}
        onLoad={onImageLoaded}
        onError={onImageError}
        crossOrigin={useCrossOrigin ? "anonymous" : undefined}
      />
    </>
  )
}

export default ImageCanvasBackground;

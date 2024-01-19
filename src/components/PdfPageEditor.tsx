import React, { useEffect, useRef, useState } from "react";
import { styled } from "styled-components";


const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  position: relative;
`

const ControllerWrapper = styled.div`
  position: absolute;
  left: 10px;
  top: 10px;
  right: 10px;
  height: 30px;
`

const CanvasWrapper = styled.div`
  position: absolute;
  left: 10px;
  top: 50px;
  right: 10px;
  bottom: 10px;

  img {
    width: 100%;
    height: 100%; 
  }

  canvas {
    cursor: crosshair;
    background-color: rgba(246, 246, 246, .25);
    border: 1px dashed;
    border-radius: 5px;
  }
`


interface IShape {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface IPdfPageEditorProps {
  data: string;
}


const PdfPageEditor: React.FC<IPdfPageEditorProps> = ({ data }) => {

  const canvasRef = useRef<HTMLCanvasElement>();

  return (
    <Wrapper>

      <ControllerWrapper>
        <button id="prev">&lt;</button>
        <button id="clear">Clear All</button>
      </ControllerWrapper>

      <CanvasWrapper>
        <img src={data} alt={"page"} />

      </CanvasWrapper>

    </Wrapper>
  )
}


export default PdfPageEditor;
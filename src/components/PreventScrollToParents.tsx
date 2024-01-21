// @flow

import useEventCallback from "hooks/useEventCallback"
import React, { useState } from "react"
import { RemoveScroll } from "react-remove-scroll";

import styled from "styled-components"


const Container = styled.div`
  & > div {
    width: 100%;
    height: 100%;
  }
`


interface IPreventScrollToParentsProps {
  children: React.ReactNode;
  onMouseMove?: (e: React.MouseEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => any;
  onMouseUp?: (e: React.MouseEvent) => any;
  onWheel?: (e: React.WheelEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}


const PreventScrollToParents: React.FC<IPreventScrollToParentsProps> = ({ 
  children,
  onMouseMove,
  onMouseDown,
  onMouseUp,
  onWheel,
  onContextMenu,
  style
}) => {

  const [mouseOver, changeMouseOver] = useState<boolean>(false);
  
  const _onMouseMove = useEventCallback((e: React.MouseEvent) => {
    if (!mouseOver) {
      changeMouseOver(true);
    }
    if (onMouseMove) {
      onMouseMove(e);
    }
  })

  const onMouseLeave = useEventCallback((e: React.MouseEvent) => {
    setTimeout(() => {
      if (mouseOver) {
        changeMouseOver(false);
      }
    }, 100);
  })

  return (
    <Container
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onWheel={onWheel}
      onContextMenu={onContextMenu}
      onMouseMove={_onMouseMove}
      onMouseLeave={onMouseLeave}
      style={style}
    >
      <RemoveScroll enabled={mouseOver} removeScrollBar={false}>
        {children}
      </RemoveScroll>
    </Container>
  )
}

export default PreventScrollToParents

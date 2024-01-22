// @flow

import useEventCallback from "hooks/useEventCallback"
import { MouseEvents } from "hooks/useMouse";
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
  mouseEvents?: MouseEvents;
  style?: React.CSSProperties;
}


const PreventScrollToParents: React.FC<IPreventScrollToParentsProps> = ({ 
  children,
  mouseEvents,
  style
}) => {

  const [mouseOver, changeMouseOver] = useState<boolean>(false);
  
  const _onMouseMove = useEventCallback((e: React.MouseEvent) => {
    if (!mouseOver) {
      changeMouseOver(true);
    }
    mouseEvents?.onMouseMove(e);
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
      onMouseDown={mouseEvents?.onMouseDown}
      onMouseUp={mouseEvents?.onMouseUp}
      onWheel={mouseEvents?.onWheel}
      onContextMenu={mouseEvents?.onContextMenu}
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

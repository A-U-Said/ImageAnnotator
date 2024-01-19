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
  style?: React.CSSProperties;
  onMouseMove?: (e: any) => void;
  onMouseDown?: (e: any, specialEvent?: {}) => any;
  onMouseUp?: (e: any) => any;
  onWheel?: (e: any) => void;
  onContextMenu?: (e: any) => void;
}


const PreventScrollToParents: React.FC<IPreventScrollToParentsProps> = ({ 
  children,
  style,
  onMouseMove,
  onMouseDown,
  onMouseUp,
  onWheel,
  onContextMenu
}) => {

  const [mouseOver, changeMouseOver] = useState<boolean>(false)
  
  const _onMouseMove = useEventCallback((e) => {
    if (!mouseOver) {
      changeMouseOver(true)
    }
    if (onMouseMove) {
      onMouseMove(e)
    }
  })

  const onMouseLeave = useEventCallback((e) => {
    setTimeout(() => {
      if (mouseOver) {
        changeMouseOver(false)
      }
    }, 100)
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

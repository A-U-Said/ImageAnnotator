import React, { useEffect, useState } from "react"
import { styled } from "styled-components";
import { SidebarItem } from "./types/workspace.types";


const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
  flex-grow: 1;
  max-width: 100vw;
`

const WorkArea = styled.div`
  height: 100%;
  position: relative;
  flex-grow: 1;
  overflow-y: auto;
  flex-shrink: 1;
  background-color: rgb(250, 250, 250);
`

const SidebarContentContainer = styled.div`
  width: 50px;
  height: 100%;
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  background-color: rgb(255, 255, 255);
`

const WorkspaceTool = styled.button<{selected?: boolean}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-sizing: border-box;
  outline: 0;
  border: 0;
  margin: 0;
  cursor: pointer;
  text-align: center;
  flex: 0 0 auto;
  font-size: 16px;
  padding: 8px;
  background-color: transparent;
  border-radius: 2px;

  ${props => props.selected && `
    background-color: #e9e9ed;
  `}
`


interface IWorkspaceProps {
  children: React.ReactNode;
  tools?: SidebarItem[];
  onItemClick?: (item: SidebarItem) => void;
}


const Workspace: React.FC<IWorkspaceProps> = ({ children, tools = [], onItemClick }) => {

  const [_tools, _setTools] = useState<SidebarItem[]>([]);

  useEffect(() => {
    _setTools(tools);
  }, [tools])


  const onClickIconSidebarItem = (item: SidebarItem) => {
    onItemClick?.(item);
  }

  return (
    <Container>

      <SidebarContent
        tools={_tools}
        onClickItem={onClickIconSidebarItem}
      />

      <WorkArea>
        { children }
      </WorkArea>

    </Container>
  )
}


interface ISidebarContentProps {
  tools: SidebarItem[];
  onClickItem?: (item: SidebarItem) => void;
}

const SidebarContent: React.FC<ISidebarContentProps> = ({
  tools = [],
  onClickItem,
}) => {

  const [selectedTool, setSelectedTool] = useState<SidebarItem>(tools?.[0]);

  return (
    <SidebarContentContainer>
      {tools.map(tool => (
        <WorkspaceTool
          key={tool.name}
          selected={tool === selectedTool}
          onClick={() => {
            //tool?.onClick();
            onClickItem?.(tool);
            setSelectedTool(tool);
          }}
        >
          {tool.icon || tool.name}
        </WorkspaceTool>
      ))}
    </SidebarContentContainer>
  )
}

export default Workspace;
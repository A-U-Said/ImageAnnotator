import React, { useEffect, useState } from "react"
import { styled } from "styled-components";
import { HeaderItem, SidebarItem } from "./types/workspace.types";


const WorkspaceWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
  max-width: 100vw;
  flex-direction: column;
`
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
  min-width: 85px;
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
  text-transform: capitalize;

  ${props => props.selected && `
    background-color: #e9e9ed;
  `}
`

const HeaderContentContainer = styled.div`
  width: 100%;
  background-color: #fff;
  border-bottom: 1px solid #ccc;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;

  > div {
    display: flex;
    align-items: center;
    flex-shrink: 1;
    width: 95%;
  }
`

const HeaderButton = styled.button`
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
  text-transform: capitalize;

  &:hover {
    background-color: #e9e9ed;
  }
`


interface IWorkspaceProps {
  children: React.ReactNode;
  title?: string;
  tools?: Array<SidebarItem>;
  headerItems?: Array<HeaderItem>;
  onToolClick?: (item: SidebarItem) => void;
  onHeaderItemClick?: (item: HeaderItem) => void;
}


const Workspace: React.FC<IWorkspaceProps> = ({ children, title, tools, headerItems, onToolClick, onHeaderItemClick }) => {

  const [_tools, _setTools] = useState<SidebarItem[]>([
    { name: "select" },
    { name: "pan" },
    { name: "zoom" },
    { name: "create-point" },
    { name: "create-box" }
  ]);

  const [_headerItems, _setHeaderItems] = useState<HeaderItem[]>([
    { name: "previous" },
    { name: "next" },
    { name: "save" }
  ]);

  useEffect(() => {
    tools && _setTools(tools);
    headerItems && _setHeaderItems(headerItems);
  }, [tools, headerItems])

  const onSidebarItemClick = (item: SidebarItem) => {
    onToolClick?.(item);
  }

  const onHeaderClick = (item: HeaderItem) => {
    onHeaderItemClick?.(item);
  }

  return (
    <WorkspaceWrapper>
      <HeaderContent
        title={title}
        items={_headerItems}
        onClickItem={onHeaderClick}
      />
      <Container>
        <SidebarContent
          tools={_tools}
          onClickItem={onSidebarItemClick}
        />
        <WorkArea>
          { children }
        </WorkArea>
      </Container>
    </WorkspaceWrapper>
  )
}


interface ISidebarContentProps {
  tools: Array<SidebarItem>;
  onClickItem?: (item: SidebarItem) => void;
}

const SidebarContent: React.FC<ISidebarContentProps> = ({
  tools = [],
  onClickItem,
}) => {

  const [selectedTool, setSelectedTool] = useState<SidebarItem>(tools?.[0]);

  return (
    <SidebarContentContainer>
      { tools.map((tool, index) => (
        <WorkspaceTool
          key={index}
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


interface IHeaderContentProps {
  title?: string;
  items: Array<HeaderItem>;
  onClickItem?: (item: HeaderItem) => void;
}

const HeaderContent: React.FC<IHeaderContentProps> = ({ title, items, onClickItem }) => {

  return (
    <HeaderContentContainer>
      <div>
        { title && <h3 style={{ flexGrow: 1 }}>{ title }</h3> }
        { items.map((item, index) => (
          <HeaderButton
            key={index}
            onClick={() => {
              //item?.onClick();
              onClickItem?.(item);
            }}
          >
            {item.icon || item.name}
          </HeaderButton>
        ))}
      </div>
    </HeaderContentContainer>
  )
}

export default Workspace;
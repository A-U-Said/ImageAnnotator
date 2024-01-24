import { HeaderItemEnum, ToolEnum } from "reducers/annotator/types/annotator.types"

export type SidebarItem = {
  name: ToolEnum, 
  icon?: React.ReactNode, 
  onClick?: () => void
}

export type HeaderItem = {
  name: HeaderItemEnum, 
  icon?: React.ReactNode, 
  onClick?: () => void
}
import { ToolEnum } from "reducers/annotator/types/annotator.types"

export type SidebarItem = {
  name: ToolEnum, 
  icon?: React.ReactNode, 
  onClick?: () => void
}
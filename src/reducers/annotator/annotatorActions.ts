import { Region } from "components/types/annotator.types"
import { HeaderItemEnum, ToolEnum } from "./types/annotator.types"


export type AnnotatorActionType = 
  SelectImageActionType |
  SelectToolActionType |
  ImageLoadedActionType |
  ChangeRegionActionType |
  BeginBoxTransformationActionType |
  SelectRegionActionType |
  BeginMovePointActionType |
  DeleteRegionActionType |
  MouseMoveActionType |
  MouseDownActionType |
  MouseUpActionType | 
  SelectHeaderItemActionType;


type SelectImageActionType = {
  type: "SELECT_IMAGE",
  payload: {
    imageIndex: number
  }
}
const selectImageAction = (selectedImage: number) : SelectImageActionType => {
  return {
    type: "SELECT_IMAGE",
    payload: {
      imageIndex: selectedImage,
    }
  }
}

type SelectToolActionType = {
  type: "SELECT_TOOL", 
  payload: {
    selectedTool: ToolEnum
  }
}
const selectToolAction = (itemName: ToolEnum) : SelectToolActionType => {
  return {
    type: "SELECT_TOOL",
    payload: {
      selectedTool: itemName,
    }
  }
}

type ImageLoadedActionType = {
  type: "IMAGE_LOADED",
  payload: {
    metadata: { 
      naturalWidth: number, 
      naturalHeight: number, 
      duration?: number 
    }
  }
}
const imageLoadedAction = (metadata: {naturalWidth: number, naturalHeight: number, duration?: number}) : ImageLoadedActionType => {
  return {
    type: "IMAGE_LOADED",
    payload: {
      metadata: metadata,
    }
  }
}

type ChangeRegionActionType = {
  type: "CHANGE_REGION",
  payload: {
    region: Region
  }
}
const changeRegionAction = (region: Region) : ChangeRegionActionType => {
  return {
    type: "CHANGE_REGION",
    payload: {
      region: region
    }
  }
}

type BeginBoxTransformationActionType = {
  type: "BEGIN_BOX_TRANSFORM",
  payload: {
    box: Region
    directions: [number, number]
  }
}
const beginBoxTransformationAction = (box: Region, directions: [number, number]) : BeginBoxTransformationActionType => {
  return {
    type: "BEGIN_BOX_TRANSFORM",
    payload: {
      box: box,
      directions: directions
    }
  }
}

type SelectRegionActionType = {
  type: "SELECT_REGION",
  payload: {
    region: Region
  }
}
const selectRegionAction = (region: Region) : SelectRegionActionType => {
  return {
    type: "SELECT_REGION",
    payload: {
      region: region
    }
  }
}

type BeginMovePointActionType = {
  type: "BEGIN_MOVE_POINT",
  payload: {
    point: Region
  }
}
const beginMovePointAction = (point: Region) : BeginMovePointActionType => {
  return {
    type: "BEGIN_MOVE_POINT",
    payload: {
      point: point
    }
  }
}

type DeleteRegionActionType = {
  type: "DELETE_REGION",
  payload: {
    region: Region
  }
}
const deleteRegionAction = (region: Region) : DeleteRegionActionType => {
  return {
    type: "DELETE_REGION",
    payload: {
      region: region
    }
  }
}

type MouseMoveActionType = {
  type: "MOUSE_MOVE",
  payload: { 
    x: number, 
    y: number 
  }
}
const mouseMoveAction = ({ x, y } : { x: number, y: number }) : MouseMoveActionType => {
  return {
    type: "MOUSE_MOVE",
    payload: {
      x: x,
      y: y
    }
  }
}

type MouseDownActionType = {
  type: "MOUSE_DOWN",
  payload: { 
    x: number, 
    y: number 
  }
}
const mouseDownAction = ({ x, y } : { x: number, y: number }) : MouseDownActionType => {
  return {
    type: "MOUSE_DOWN",
    payload: {
      x: x,
      y: y
    }
  }
}

type MouseUpActionType = {
  type: "MOUSE_UP",
  payload: { 
    x: number, 
    y: number 
  }
}
const mouseUpAction = ({ x, y } : { x: number, y: number }) : MouseUpActionType => {
  return {
    type: "MOUSE_UP",
    payload: {
      x: x,
      y: y
    }
  }
}


type SelectHeaderItemActionType = {
  type: "HEADER_BUTTON_CLICKED",
  payload: {
    buttonName: HeaderItemEnum
  }
}
const SelectHeaderItemAction = (buttonName: HeaderItemEnum) : SelectHeaderItemActionType => {
  return {
    type: "HEADER_BUTTON_CLICKED",
    payload: {
      buttonName: buttonName
    }
  }
}


const annotatorActions = {
  selectImageAction,
  selectToolAction,
  imageLoadedAction,
  changeRegionAction,
  beginBoxTransformationAction,
  selectRegionAction,
  beginMovePointAction,
  deleteRegionAction,
  mouseMoveAction,
  mouseDownAction,
  mouseUpAction,
  SelectHeaderItemAction
}

export default annotatorActions;
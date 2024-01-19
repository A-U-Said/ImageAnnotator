import React, { useEffect, useReducer, useRef } from "react"
import { AnnotationImage, KeypointsDefinition } from "components/types/annotator.types";
import useEventCallback from "hooks/useEventCallback";
import AnnotatorReducer, { IAnnotatorState } from "reducers/annotator/annotatorReducer";
import { ToolEnum } from "reducers/annotator/types/annotator.types";
import Workspace from "./Workspace";
import { SidebarItem } from "./types/workspace.types";
import ImageCanvas from "./ImageCanvas";

interface IAnnotatorProps {
  images?: Array<AnnotationImage>;
  allowedArea?: { x: number, y: number, w: number, h: number };
  selectedImage?: number;
  selectedTool?: ToolEnum;
  regionTagList?: Array<string>;
  regionClsList?: Array<string>;
  onExit: (MainLayoutState: any) => void;
  keypointDefinitions?: KeypointsDefinition;
}


const Annotator: React.FC<IAnnotatorProps> = ({
  images,
  allowedArea,
  selectedImage = images && images.length > 0 ? 0 : undefined,
  selectedTool = "select",
  regionTagList = [],
  regionClsList = [],
  onExit,
  keypointDefinitions
}) => {


  const tools: SidebarItem[] = [
    {
      name: "select",
    },
    {
      name: "pan",
    },
    {
      name: "zoom",
    },
    {
      name: "create-point",
    },
    {
      name: "create-box",
    },
  ];
 

  const [state, dispatchToReducer] = useReducer(AnnotatorReducer, {
    allowedArea,
    selectedTool,
    regionClsList,
    regionTagList,
    keypointDefinitions,
    selectedImage,
    images,
    mode: null,
    history: [], 
    currentImageIndex: 0
  })

  useEffect(() => {
    if (!selectedImage || !state?.images) {
      return
    }
    dispatchToReducer({
      type: "SELECT_IMAGE",
      imageIndex: selectedImage,
      image: state.images[selectedImage],
    })
  }, [selectedImage, state?.images])

  const dispatch = useEventCallback((action) => {
    dispatchToReducer(action)
  })

  const handleExit = () => {
    return onExit(state);
  }

  const action = (type: string, ...params: Array<string>) => {
    const fn = (...args: any) =>
      params.length > 0
        ? dispatch(
            ({
              type,
              ...params.reduce((acc: any, p, i) => ((acc[p as keyof typeof acc] = args[i]), acc), {}),
            })
          )
        : dispatch({ type, ...args[0] })
    return fn
  }

  const getActiveImage = (state: IAnnotatorState) => {
    var currentImageIndex = null, activeImage
    currentImageIndex = state?.selectedImage
    if (currentImageIndex === -1) {
      currentImageIndex = null
      activeImage = null
    } else {
      activeImage = state?.images[currentImageIndex]
    }
    return { currentImageIndex, activeImage }
  }

  const onClickIconSidebarItem = useEventCallback((item: SidebarItem) => {
    dispatch({ 
      type: "SELECT_TOOL", 
      payload: {
        selectedTool: item.name 
      }
    })
  })

  if (!images) {
    return (
      <>{'Missing required prop "images"'}</>
    )
  }

  const { activeImage } = getActiveImage(state);
  
  return (
    <>
      <button onClick={handleExit}>Exit</button>

      <Workspace
        tools={tools}
        onItemClick={onClickIconSidebarItem}
      >
        <>
        <ImageCanvas
          key={state.selectedImage}
          allowedArea={state.allowedArea}
          regionClsList={state.regionClsList}
          regionTagList={state.regionTagList}
          regions={activeImage.regions || []}
          imageSrc={activeImage.src}
          createWithPrimary={state.selectedTool.includes("create")}
          dragWithPrimary={state.selectedTool === "pan"}
          zoomWithPrimary={state.selectedTool === "zoom"}
          keypointDefinitions={state.keypointDefinitions}
          onMouseMove={action("MOUSE_MOVE")}
          onMouseDown={action("MOUSE_DOWN")}
          onMouseUp={action("MOUSE_UP")}
          onChangeRegion={action("CHANGE_REGION", "region")}
          onDeleteRegion={action("DELETE_REGION", "region")}
          onBeginBoxTransform={action("BEGIN_BOX_TRANSFORM", "box", "directions")}
          onBeginMovePolygonPoint={action(
            "BEGIN_MOVE_POLYGON_POINT",
            "polygon",
            "pointIndex"
          )}
          onBeginMoveKeypoint={action(
            "BEGIN_MOVE_KEYPOINT",
            "region",
            "keypointId"
          )}
          onAddPolygonPoint={action(
            "ADD_POLYGON_POINT",
            "polygon",
            "point",
            "pointIndex"
          )}
          onSelectRegion={action("SELECT_REGION", "region")}
          onBeginMovePoint={action("BEGIN_MOVE_POINT", "point")}
          onImageOrVideoLoaded={action("IMAGE_OR_VIDEO_LOADED", "metadata")}
        />
        </>
        
      </Workspace>
    </>
  )
}


export default Annotator;
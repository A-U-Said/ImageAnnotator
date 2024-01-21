import React, { useEffect, useReducer, useState } from "react"
import { AnnotationImage } from "components/types/annotator.types";
import useEventCallback from "hooks/useEventCallback";
import AnnotatorReducer from "reducers/annotator/annotatorReducer";
import { ToolEnum } from "reducers/annotator/types/annotator.types";
import Workspace from "./Workspace";
import { SidebarItem } from "./types/workspace.types";
import ImageCanvas from "./ImageCanvas";


interface IAnnotatorProps {
  images: Array<AnnotationImage>;
  selectedImage?: number;
  selectedTool?: ToolEnum;
  regionTagList?: Array<string>;
  regionClsList?: Array<string>;
  onExit?: (MainLayoutState: any) => void;
}


const Annotator: React.FC<IAnnotatorProps> = ({
  images,
  selectedImage = images && images.length > 0 ? 0 : undefined,
  selectedTool = "select",
  regionTagList = [],
  regionClsList = [],
  onExit,
}) => {

  const [state, dispatchToReducer] = useReducer(AnnotatorReducer, {
    selectedTool,
    regionClsList,
    regionTagList,
    selectedImage,
    images,
    mode: null,
    history: [], 
    currentImageIndex: 0
  });

  const [activeImage, setActiveImage] = useState<AnnotationImage | null>(null);

  useEffect(() => {
    var currentImageIndex = state?.selectedImage
    if (currentImageIndex !== -1) {
      setActiveImage(state?.images[currentImageIndex]);
    }
  }, [state?.selectedImage, state?.images]);

  useEffect(() => {
    if (!selectedImage || !state?.images) {
      return;
    }
    dispatchToReducer({
      type: "SELECT_IMAGE",
      imageIndex: selectedImage,
      image: state.images[selectedImage],
    });
  }, [selectedImage, state?.images]);

  const dispatch = useEventCallback((action) => {
    dispatchToReducer(action);
  })

  const handleExit = () => {
    return onExit?.(state);
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
        : dispatch({ type, ...args[0] });
    return fn;
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
 
  return (
    <>
      <button onClick={handleExit}>Exit</button>

      <Workspace
        onItemClick={onClickIconSidebarItem}
      >
        <>
        { activeImage && (
          <ImageCanvas
            regions={activeImage.regions || []}
            imageSrc={activeImage.src}
            onMouseMove={action("MOUSE_MOVE")}
            onMouseDown={action("MOUSE_DOWN")}
            onMouseUp={action("MOUSE_UP")}
            dragWithPrimary={state.selectedTool === "pan"}
            zoomWithPrimary={state.selectedTool === "zoom"}
            createWithPrimary={state.selectedTool.includes("create")}
            regionClsList={state.regionClsList}
            regionTagList={state.regionTagList}
            onImageOrVideoLoaded={action("IMAGE_OR_VIDEO_LOADED", "metadata")}
            onChangeRegion={action("CHANGE_REGION", "region")}
            onBeginBoxTransform={action("BEGIN_BOX_TRANSFORM", "box", "directions")}
            onSelectRegion={action("SELECT_REGION", "region")}
            onBeginMovePoint={action("BEGIN_MOVE_POINT", "point")}
            onDeleteRegion={action("DELETE_REGION", "region")}
          />
        )}
        </>
      </Workspace>
    </>
  )
}


export default Annotator;
import React, { useEffect, useReducer, useState } from "react"
import { AnnotationImage } from "components/types/annotator.types";
import useEventCallback from "hooks/useEventCallback";
import AnnotatorReducer, { IAnnotatorState } from "reducers/annotator/annotatorReducer";
import { ToolEnum } from "reducers/annotator/types/annotator.types";
import Workspace from "./Workspace";
import { HeaderItem, SidebarItem } from "./types/workspace.types";
import ImageCanvas from "./ImageCanvas";
import { AnnotatorActionType } from "reducers/annotator/annotatorActions";
import annotatorActions from "reducers/annotator/annotatorActions";
const { 
  selectImageAction,
  selectToolAction,
  mouseMoveAction,
  mouseDownAction,
  mouseUpAction,
  imageLoadedAction,
  changeRegionAction,
  beginBoxTransformationAction,
  selectRegionAction,
  beginMovePointAction,
  deleteRegionAction,
  SelectHeaderItemAction
} = annotatorActions;


interface IAnnotatorProps {
  images: Array<AnnotationImage>;
  selectedImage?: number;
  selectedTool?: ToolEnum;
  regionTagList?: Array<string>;
  regionClsList?: Array<string>;
  colors?: Array<string>;
  onExit?: (MainLayoutState: IAnnotatorState) => void;
}

const defaultColors = [
  "#f44336",
  "#2196f3",
  "#4caf50",
  "#ef6c00",
  "#795548",
  "#689f38",
  "#e91e63",
  "#9c27b0",
  "#3f51b5",
  "#009688",
  "#cddc39",
  "#607d8b"
];


const Annotator: React.FC<IAnnotatorProps> = ({
  images,
  selectedImage = images && images.length > 0 ? 0 : undefined,
  selectedTool = "select",
  regionTagList = [],
  regionClsList = [],
  colors,
  onExit,
}) => {

  const [state, dispatchToReducer] = useReducer(AnnotatorReducer, {
    selectedTool,
    regionClsList,
    regionTagList,
    selectedImage,
    images,
    mode: null,
    colors: colors || defaultColors,
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
    dispatchToReducer(selectImageAction(selectedImage));
  }, [selectedImage, state?.images]);


  const dispatch = useEventCallback((action: AnnotatorActionType) => {
    dispatchToReducer(action);
  })

  const action = <T extends (...args: Parameters<T>) => AnnotatorActionType>(callback: T) => {
    return (...args: Parameters<T>) => dispatch(callback(...args));
  }

  const onClickSidebarItem = useEventCallback((item: SidebarItem) => {
    dispatch(selectToolAction(item.name));
  })

  const onClickHeaderItem = useEventCallback((item: HeaderItem) => {
    if (item.name === "save") {
      return onExit?.(state);
    }
    else {
      dispatch(SelectHeaderItemAction(item.name));
    }
  })

  if (!images) {
    return (
      <>{'Missing required prop "images"'}</>
    )
  }
 
  return (
    <>
    { activeImage && (
      <Workspace
        title={activeImage.name}
        onToolClick={onClickSidebarItem}
        onHeaderItemClick={onClickHeaderItem}
      >
        <ImageCanvas
          imageSrc={activeImage.src}
          regions={activeImage.regions}
          selectedTool={state.selectedTool}
          regionClsList={state.regionClsList}
          regionTagList={state.regionTagList}
          onMouseMove={action(mouseMoveAction)}
          onMouseDown={action(mouseDownAction)}
          onMouseUp={action(mouseUpAction)}
          onImageLoaded={action(imageLoadedAction)}
          onChangeRegion={action(changeRegionAction)}
          onBeginBoxTransform={action(beginBoxTransformationAction)}
          onSelectRegion={action(selectRegionAction)}
          onBeginMovePoint={action(beginMovePointAction)}
          onDeleteRegion={action(deleteRegionAction)}
        />
      </Workspace>
    )}
    </>
  )
}


export default Annotator;
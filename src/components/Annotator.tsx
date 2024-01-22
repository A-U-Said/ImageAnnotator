import React, { useEffect, useReducer, useState } from "react"
import { AnnotationImage } from "components/types/annotator.types";
import useEventCallback from "hooks/useEventCallback";
import AnnotatorReducer, { IAnnotatorState } from "reducers/annotator/annotatorReducer";
import { ToolEnum } from "reducers/annotator/types/annotator.types";
import Workspace from "./Workspace";
import { SidebarItem } from "./types/workspace.types";
import ImageCanvas from "./ImageCanvas";
import { AnnotatorActionType } from "reducers/annotator/annotatorActions";
import annotatorActions from "reducers/annotator/annotatorActions";


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
    dispatchToReducer(annotatorActions.selectImageAction(selectedImage));
  }, [selectedImage, state?.images]);


  const dispatch = useEventCallback((action: AnnotatorActionType) => {
    dispatchToReducer(action);
  })

  const handleExit = () => {
    return onExit?.(state);
  }

  const action = <T extends (...args: Parameters<T>) => AnnotatorActionType>(callback: T) => {
    return (...args: Parameters<T>) => dispatch(callback(...args));
  }

  const onClickIconSidebarItem = useEventCallback((item: SidebarItem) => {
    dispatch(annotatorActions.selectToolAction(item.name));
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
            imageSrc={activeImage.src}
            regions={activeImage.regions}
            selectedTool={state.selectedTool}
            regionClsList={state.regionClsList}
            regionTagList={state.regionTagList}
            onMouseMove={action(annotatorActions.mouseMoveAction)}
            onMouseDown={action(annotatorActions.mouseDownAction)}
            onMouseUp={action(annotatorActions.mouseUpAction)}
            onImageLoaded={action(annotatorActions.imageLoadedAction)}
            onChangeRegion={action(annotatorActions.changeRegionAction)}
            onBeginBoxTransform={action(annotatorActions.beginBoxTransformationAction)}
            onSelectRegion={action(annotatorActions.selectRegionAction)}
            onBeginMovePoint={action(annotatorActions.beginMovePointAction)}
            onDeleteRegion={action(annotatorActions.deleteRegionAction)}
          />
        )}
        </>
      </Workspace>
    </>
  )
}


export default Annotator;
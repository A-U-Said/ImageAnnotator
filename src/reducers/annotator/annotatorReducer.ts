import { AnnotationImage, Box, Region } from "components/types/annotator.types"
import { Mode, ToolEnum } from "./types/annotator.types"
import { AnnotatorActionType } from "./annotatorActions";


export interface IAnnotatorState {
  mouseDownAt?: { x: number, y: number };
  selectedTool: ToolEnum;
  selectedCls?: string;
  mode: Mode;
  regionClsList?: Array<string>;
  regionTagList?: Array<string>;
  history: Array<{ time: Date, state: IAnnotatorState, name: string }>;
  selectedImage?: number;
  images: Array<AnnotationImage>;
  currentImageIndex: number;
  lastMouseMoveCall?: number;
}


const AnnotatorReducer = (state: IAnnotatorState, action: AnnotatorActionType) : IAnnotatorState => {

  console.log(action);

  const getRandomId = () => Math.random().toString().split(".")[1]

  switch (action.type) {

    case "SELECT_TOOL":
      return {
        ...state,
        selectedTool: action.payload.selectedTool
      }

    case "IMAGE_LOADED":
      return {
        ...state,
        images: state.images.map((image, index) =>
          index === state.selectedImage
          ? { ...image, 
            pixelSize: {
              w: action.payload.metadata.naturalWidth,
              h: action.payload.metadata.naturalHeight
            }
          }
          : image
        )
      }

      case "BEGIN_MOVE_POINT": 
        return {
          ...state,
          mode: { 
            mode: "MOVE_REGION",
            regionId: action.payload.point.id
          }
        }

      case "BEGIN_BOX_TRANSFORM": {
        const { box, directions } = action.payload

        var BEGIN_BOX_TRANSFORM_STATE = {
          ...state,
          images: state.images.map((image, index) =>
            index === state.selectedImage
            ? { 
                ...image, 
                regions: (image.regions || []).map((region, regionIndex) => 
                  ({ 
                    ...region, 
                    editingLabels: false, 
                  })
                )
            }
            : image
          )
        }

        if (directions[0] === 0 && directions[1] === 0) {
          return {
            ...BEGIN_BOX_TRANSFORM_STATE,
            mode: { 
              mode: "MOVE_REGION", 
              regionId: box.id 
            }
          }
        } else {
          var _box = box as Box;
          return {
            ...BEGIN_BOX_TRANSFORM_STATE,
            mode: {
              mode: "RESIZE_BOX",
              regionId: _box.id,
              freedom: directions,
              original: { x: _box.x, y: _box.y, w: _box.w, h: _box.h },
            }
          }
        }
      }

      case "MOUSE_DOWN": {
        const { x, y } = action.payload

        if (!state.images[state.selectedImage]) {
          return state
        }
    
        var _MOUSE_DOWN_STATE = {
          ...state,
          mouseDownAt: { x, y }
        }
      
        var newRegion: Region;
        var defaultRegionColor = "rgba(255,0,0,0.75)"
     
        switch (_MOUSE_DOWN_STATE.selectedTool) {

          case "create-point": {
            //state = saveToHistory(state, "Create Point")
            newRegion = {
              type: "point",
              x,
              y,
              highlighted: true,
              editingLabels: true,
              color: defaultRegionColor,
              id: getRandomId(),
              cls: _MOUSE_DOWN_STATE.selectedCls,
            }
            break
          }
          
          case "create-box": {
            //state = saveToHistory(state, "Create Box")
            newRegion = {
              type: "box",
              x: x,
              y: y,
              w: 0,
              h: 0,
              highlighted: true,
              editingLabels: false,
              color: defaultRegionColor,
              cls: _MOUSE_DOWN_STATE.selectedCls,
              id: getRandomId(),
            }
            _MOUSE_DOWN_STATE = {
              ..._MOUSE_DOWN_STATE,
              mode: {
                mode: "RESIZE_BOX",
                editLabelEditorAfter: true,
                regionId: newRegion.id,
                freedom: [1, 1],
                original: { x, y, w: newRegion.w, h: newRegion.h },
                isNew: true,
              }
            }
            break
          }

          default:
            break
        }
     
        return {
          ..._MOUSE_DOWN_STATE, 
          images: _MOUSE_DOWN_STATE.images.map((image, index) =>
            index === _MOUSE_DOWN_STATE.selectedImage
            ? { 
                ...image, 
                regions: [...(image.regions || []).map((region, regionIndex) => 
                  ({ 
                    ...region, 
                    editingLabels: false, 
                    highlighted: false 
                  })
                ), (newRegion ? newRegion : undefined)].filter(x => x !== undefined)
            }
            : image
          )
        }
      }


      case "MOUSE_MOVE": {
        const { x, y } = action.payload
  
        if (!state.mode) {
          return state
        }

        if (!state.images[state.selectedImage]) {
          return state
        }

        var _MOUSE_MOVE_STATE = {
          ...state,
        }

        switch (state.mode.mode) {

          case "RESIZE_BOX": {
            const {
              regionId,
              freedom: [xFree, yFree],
              original: { x: ox, y: oy, w: ow, h: oh },
            } = state.mode

            const dx = xFree === 0 ? ox : xFree === -1 ? Math.min(ox + ow, x) : ox
            const dw =
              xFree === 0
                ? ow
                : xFree === -1
                ? ow + (ox - dx)
                : Math.max(0, ow + (x - ox - ow))
            const dy = yFree === 0 ? oy : yFree === -1 ? Math.min(oy + oh, y) : oy
            const dh =
              yFree === 0
                ? oh
                : yFree === -1
                ? oh + (oy - dy)
                : Math.max(0, oh + (y - oy - oh))

            // determine if we should switch the freedom

            if (dw <= 0.001) {
              _MOUSE_MOVE_STATE = {
                ..._MOUSE_MOVE_STATE, 
                mode: {
                  ..._MOUSE_MOVE_STATE.mode,
                  //@ts-ignore
                  freedom: [xFree * -1, yFree]
                }
              }
            }

            if (dh <= 0.001) {
              _MOUSE_MOVE_STATE = {
                ..._MOUSE_MOVE_STATE,
                mode: {
                  ..._MOUSE_MOVE_STATE.mode,
                  //@ts-ignore
                  freedom: [xFree, yFree * -1]
                }
              }
            }

            const regionIndex = (state.images[state.selectedImage].regions || [])
              .findIndex((r) => r.id === regionId)

            if (regionIndex === -1) {
              return _MOUSE_MOVE_STATE
            }

            return {
              ..._MOUSE_MOVE_STATE,
              images: _MOUSE_MOVE_STATE.images.map((image, index) =>
                index === _MOUSE_MOVE_STATE.selectedImage
                ? { 
                    ...image, 
                    regions: (image.regions || []).map((region, rIndex) => 
                      rIndex === regionIndex
                        ? {
                          ...region, 
                          x: dx,
                          w: dw,
                          y: dy,
                          h: dh
                        }
                        : region
                    )
                }
                : image
              )
            }
          }

          case "MOVE_REGION": {
            const regionIndex = (_MOUSE_MOVE_STATE.images[_MOUSE_MOVE_STATE.selectedImage].regions || [])
              .findIndex((r) => r.id === _MOUSE_MOVE_STATE.mode.regionId)

            return {
              ..._MOUSE_MOVE_STATE,
              images: _MOUSE_MOVE_STATE.images.map((image, index) =>
                index === _MOUSE_MOVE_STATE.selectedImage
                ? { 
                    ...image,
                    regions: (image.regions || []).map((region, rIndex) => 
                      rIndex === regionIndex
                      ? region.type === "box"
                        ? { 
                            ...region, 
                            x: x - region.w / 2, 
                            y: y - region.h / 2 
                          }
                        : region.type === "point"
                          ? { 
                              ...region, 
                              x: x, 
                              y: y 
                            }
                          : region
                      : region
                  )
                }
                : image
              )
            }
              // [...pathToActiveImage, "regions", regionIndex],
              // moveRegion(activeImage.regions[regionIndex], x, y)
          }

          default:
            return _MOUSE_MOVE_STATE
        }
      }


      case "MOUSE_UP": {
        const { x, y } = action.payload

        if (!state.mode) {
          return state
        }

        var _MOUSE_UP_STATE: IAnnotatorState = {
          ...state,
          mouseDownAt: null
        }

        switch (_MOUSE_UP_STATE.mode.mode) {

          case "RESIZE_BOX": {
            if (_MOUSE_UP_STATE.mode.isNew) {
              if (
                Math.abs(_MOUSE_UP_STATE.mode.original.x - x) < 0.002 ||
                Math.abs(_MOUSE_UP_STATE.mode.original.y - y) < 0.002
              ) {

                const regionIndex = (_MOUSE_UP_STATE.images[_MOUSE_UP_STATE.selectedImage].regions || [])
                  .findIndex((r) => r.id === _MOUSE_UP_STATE.mode.regionId)

                if (regionIndex === -1) {
                  return _MOUSE_MOVE_STATE
                }

                const region = _MOUSE_UP_STATE.images[state.selectedImage]?.regions[regionIndex]

                return {
                  ..._MOUSE_UP_STATE,
                  images: _MOUSE_UP_STATE.images.map((image, index) =>
                    index === _MOUSE_UP_STATE.selectedImage
                    ? { 
                      ...image, 
                      regions: (image.regions || []).filter((r) => r.id !== region.id)
                    }
                    : image
                  ),
                  mode: null
                }
              }
            }
            if (_MOUSE_UP_STATE.mode.editLabelEditorAfter) {

              const regionIndex = (_MOUSE_UP_STATE.images[_MOUSE_UP_STATE.selectedImage].regions || [])
              .findIndex((r) => r.id === _MOUSE_UP_STATE.mode.regionId)

              if (regionIndex === -1) {
                return _MOUSE_UP_STATE
              }

              return {
                ..._MOUSE_UP_STATE,
                images: _MOUSE_UP_STATE.images.map((image, index) =>
                    index === _MOUSE_UP_STATE.selectedImage
                    ? {
                      ...image,
                      regions: (image.regions || []).map((region, rIndex) => 
                        rIndex === regionIndex
                        ? {
                          ...region,
                          editingLabels: true
                        }
                        : region
                      )
                    }
                    : image
                ),
                mode: null
              }
            }
            return { 
              ..._MOUSE_UP_STATE, 
              mode: null 
            }
          }

          case "MOVE_REGION":
          case "RESIZE_KEYPOINTS":
          case "MOVE_POLYGON_POINT": {
            return { 
              ..._MOUSE_UP_STATE, 
              mode: null 
            }
          }

          case "MOVE_KEYPOINT": {
            return { 
              ..._MOUSE_UP_STATE, 
              mode: null 
            }
          }

          default:
            return _MOUSE_UP_STATE
        }
      }


      case "DELETE_REGION": {
        return {
          ...state,
          images: state.images.map((image, index) =>
            index === state.selectedImage
              ? {
                ...image,
                regions: (image.regions || []).filter((r) => r.id !== action.payload.region.id)
              }
              : image
          ),
        }
      }


      case "CHANGE_REGION": {
        var CHANGE_REGION_STATE = {
          ...state
        }
        const activeImage = state.images[state.selectedImage]
        const regionIndex = (activeImage.regions || []).findIndex(
          (r) => r.id === action.payload.region.id
        )
        const oldRegion = state.images[state.selectedImage].regions[regionIndex]
        if (oldRegion.cls !== action.payload.region.cls) {
          CHANGE_REGION_STATE = {
            ...CHANGE_REGION_STATE,
            selectedCls: CHANGE_REGION_STATE.regionClsList.indexOf(action.payload.region.cls) !== 1
              ? action.payload.region.cls
              : CHANGE_REGION_STATE.selectedCls
          }
        }


        return {
          ...CHANGE_REGION_STATE,
          images: CHANGE_REGION_STATE.images.map((image, index) =>
            index === CHANGE_REGION_STATE.selectedImage
              ? {
                ...image,
                regions: (image.regions || []).map((r, i) => 
                  r.id === action.payload.region.id
                    ? action.payload.region
                    : r
                )
              }
              : image
          )
        }
      }


      case "SELECT_REGION": {
        const { region } = action.payload

        return {
          ...state,
          images: state.images.map((image, index) =>
            index === state.selectedImage
              ? {
                ...image,
                regions: (image.regions || []).map((r, i) => 
                  ({
                    ...r,
                    highlighted: r.id === region.id,
                    editingLabels: r.id === region.id,
                  })
                )
              }
              : image
          )
        }
      }


      case "SELECT_IMAGE": {
        return {
          ...state,
          selectedImage: action.payload.imageIndex
        }
      }


    default:
      return state
  }
}


export default AnnotatorReducer;
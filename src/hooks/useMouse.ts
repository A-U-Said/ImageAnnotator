import { useRef } from "react"
import Matrix from "../matrix";
import { LayoutParams } from "components/types/imageCanvas.types";


type props = {
  canvasEl: React.MutableRefObject<HTMLCanvasElement>;
  changeMat: React.Dispatch<React.SetStateAction<Matrix>>;
  changeDragging: React.Dispatch<React.SetStateAction<boolean>>;
  zoomStart: {x: number, y: number};
  zoomEnd: {x: number, y: number};
  changeZoomStart: React.Dispatch<React.SetStateAction<{x: number, y: number}>>;
  changeZoomEnd: React.Dispatch<React.SetStateAction<{x: number, y: number}>>;
  layoutParams: React.MutableRefObject<LayoutParams>;
  zoomWithPrimary: boolean;
  dragWithPrimary: boolean;
  mat: Matrix;
  onMouseMove: (p : { x: number, y: number }) => void;
  onMouseUp: (p : { x: number, y: number }) => void;
  onMouseDown: (p : { x: number, y: number }) => void;
  dragging: boolean;
}


const getDefaultMat = () => Matrix.from(1, 0, 0, 1, -10, -10);


const useMouse = ({
  canvasEl,
  changeMat,
  changeDragging,
  zoomStart,
  zoomEnd,
  changeZoomStart,
  changeZoomEnd,
  layoutParams,
  zoomWithPrimary,
  dragWithPrimary,
  mat,
  onMouseMove,
  onMouseUp,
  onMouseDown,
  dragging,
}: props) => {

  const mousePosition = useRef({ x: 0, y: 0 });
  const prevMousePosition = useRef({ x: 0, y: 0 });

  const zoomIn = (direction: number | { to: number }, point: { x: number; y: number; }) => {
    const [mx, my] = [point.x, point.y];
    var scale = typeof direction === "object" 
      ? direction.to / mat.a 
      : 1 + 0.2 * direction;

    // NOTE: We're mutating mat here
    mat.translate(mx, my).scaleU(scale);
    if (mat.a > 2) {
      mat.scaleU(2 / mat.a);
    }
    if (mat.a < 0.05) {
      mat.scaleU(0.05 / mat.a);
    }
    mat.translate(-mx, -my);

    changeMat(mat.clone());
  }

  const mouseEvents = {
    onMouseMove: (e: React.MouseEvent) => {
      const { left, top } = canvasEl.current.getBoundingClientRect();
      prevMousePosition.current.x = mousePosition.current.x;
      prevMousePosition.current.y = mousePosition.current.y;
      mousePosition.current.x = e.clientX - left;
      mousePosition.current.y = e.clientY - top;

      const projMouse = mat.applyToPoint(
        mousePosition.current.x,
        mousePosition.current.y
      );

      if (zoomWithPrimary && zoomStart) {
        changeZoomEnd(projMouse);
      }

      const { iw, ih } = layoutParams.current || {};
      onMouseMove({ x: projMouse.x / iw, y: projMouse.y / ih });

      if (dragging) {
        mat.translate(
          prevMousePosition.current.x - mousePosition.current.x,
          prevMousePosition.current.y - mousePosition.current.y
        );
        changeMat(mat.clone());
      }
      e.preventDefault();
    },
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault();
      if (
        e.button === 1 ||
        e.button === 2 ||
        (e.button === 0 && dragWithPrimary)
      )
        return changeDragging(true);

      const projMouse = mat.applyToPoint(
        mousePosition.current.x,
        mousePosition.current.y
      );
      if (zoomWithPrimary && e.button === 0) {
        changeZoomStart(projMouse);
        changeZoomEnd(projMouse);
        return;
      }
      if (e.button === 0) {
        const { iw, ih } = layoutParams.current;
        onMouseDown({ x: projMouse.x / iw, y: projMouse.y / ih });
      }
    },
    onMouseUp: (e: React.MouseEvent) => {
      e.preventDefault();
      const projMouse = mat.applyToPoint(
        mousePosition.current.x,
        mousePosition.current.y
      );
      if (zoomStart) {
        const zoomEnd = projMouse;
        if (
          Math.abs(zoomStart.x - zoomEnd.x) < 10 &&
          Math.abs(zoomStart.y - zoomEnd.y) < 10
        ) {
          if (mat.a < 1) {
            zoomIn({ to: 1 }, mousePosition.current);
          } else {
            zoomIn({ to: 0.25 }, mousePosition.current);
          }
        } else {
          const { iw, ih } = layoutParams.current;

          if (zoomStart.x > zoomEnd.x) {
            ;[zoomStart.x, zoomEnd.x] = [zoomEnd.x, zoomStart.x]
          }
          if (zoomStart.y > zoomEnd.y) {
            ;[zoomStart.y, zoomEnd.y] = [zoomEnd.y, zoomStart.y]
          }

          // The region defined by zoomStart and zoomEnd should be the new transform
          let scale = Math.min(
            (zoomEnd.x - zoomStart.x) / iw,
            (zoomEnd.y - zoomStart.y) / ih
          );
          if (scale < 0.05) scale = 0.05
          if (scale > 10) scale = 10

          const newMat = getDefaultMat()
            .translate(zoomStart.x, zoomStart.y)
            .scaleU(scale)

          changeMat(newMat.clone())
        }

        changeZoomStart(null)
        changeZoomEnd(null)
      }
      if (
        e.button === 1 ||
        e.button === 2 ||
        (e.button === 0 && dragWithPrimary)
      )
        return changeDragging(false)
      if (e.button === 0) {
        const { iw, ih } = layoutParams.current
        onMouseUp({ x: projMouse.x / iw, y: projMouse.y / ih })
      }
    },
    onWheel: (e: React.WheelEvent) => {
      const direction = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0
      zoomIn(direction, mousePosition.current)
      // e.preventDefault()
    },
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault()
    },
  }
  return { mouseEvents, mousePosition }
}


export default useMouse;
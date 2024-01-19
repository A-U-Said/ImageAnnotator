import { useEffect, useRef } from "react";


const useInterval: (callback: () => void, delay?: number | null | undefined) => void = (callback, delay) => {

  var savedCallback = useRef(() => { });

  useEffect(() => {
      savedCallback.current = callback;
  });

  useEffect(() => {
      if (delay !== null) {
          var interval_1 = setInterval(function () { return savedCallback.current(); }, delay || 0);
          return function () { return clearInterval(interval_1); };
      }
      return undefined;
  }, [delay]);
  
};

export default useInterval;
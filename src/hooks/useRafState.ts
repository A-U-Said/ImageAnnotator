import { Dispatch, EffectCallback, SetStateAction, useCallback, useEffect, useRef, useState } from "react";

const useRafState: <S>(initialState: S | (() => S)) => [S, Dispatch<SetStateAction<S>>] = (initialState) => {

    const frame = useRef(0);
    const [state, setState] = useState(initialState);

    var setRafState = useCallback((value: any) => {
        cancelAnimationFrame(frame.current);
        frame.current = requestAnimationFrame(function () {
            setState(value);
        });
    }, []);

    useUnmount(function () {
        cancelAnimationFrame(frame.current);
    });

    return [state, setRafState];
};

export default useRafState;


const useUnmount: (fn: () => any) => void = (fn) => {
    const fnRef = useRef(fn);
    fnRef.current = fn;
    useEffectOnce(function () { return function () { return fnRef.current(); }; });
};



var useEffectOnce: (effect: EffectCallback) => void = (effect) => {
  useEffect(effect, []);
};

import { useEffect, useRef } from "react";

export default function useUpdateEffect(effect, dependencyArray = []) {
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      console.log('Triggered on initial render')
    } else {
      console.log('Effect should trigger')
      return effect();
    }
  }, dependencyArray);
}

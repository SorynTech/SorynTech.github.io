import { useState, useEffect } from 'react';

const SKELETON_MIN_DELAY = 500;

export default function useDelayedLoad(delay = SKELETON_MIN_DELAY) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return isLoaded;
}

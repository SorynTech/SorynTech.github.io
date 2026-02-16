import { useState, useEffect } from 'react';

export default function useDelayedLoad(delay = 500) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return isLoaded;
}

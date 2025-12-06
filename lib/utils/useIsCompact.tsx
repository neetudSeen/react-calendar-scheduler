import { useState, useEffect } from 'react';

export const useIsCompact = (breakpoint = 1000): boolean => {
  const [isCompact, setIsCompact] = useState(window.innerWidth < breakpoint);

  useEffect(() => {
    const handleResize = () => setIsCompact(window.innerWidth < breakpoint);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isCompact;
};

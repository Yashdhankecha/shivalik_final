import { useEffect, useState } from 'react';

const useScreenSize = () => {
    const [isMobile, setIsMobile] = useState(window.matchMedia('(max-width: 425px)').matches);

    useEffect(() => {
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        window.matchMedia('(max-width: 425px)').addEventListener('change', handler);
        return () => window.matchMedia('(max-width: 425px)').removeEventListener('change', handler);
    }, []);

    return { isMobile };
};

export default useScreenSize;

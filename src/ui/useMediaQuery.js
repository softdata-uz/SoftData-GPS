import {useEffect, useState} from 'react';

/** Telefon chegarasi — jadvallar shu kenglikdan tor ekranda ixcham ko'rinishga o'tadi. */
export const MOBILE_QUERY = '(max-width: 767px)';

const match = (query) => typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    && window.matchMedia(query).matches;

/** CSS media so'rovi hozir to'g'rimi — ekran o'lchami o'zgarsa yangilanadi. */
const useMediaQuery = (query = MOBILE_QUERY) => {
    const [matches, setMatches] = useState(() => match(query));

    useEffect(() => {
        if (typeof window.matchMedia !== 'function') return undefined;
        const mq = window.matchMedia(query);
        const onChange = () => setMatches(mq.matches);
        onChange();
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, [query]);

    return matches;
};

export default useMediaQuery;

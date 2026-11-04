import React from 'react';
import './loader.css';

// Umumiy yuklanish ko'rsatkichi: sahifa xiralashadi, markazda aylanuvchi halqa va ichida pulslanuvchi nuqta
// (kirish sahifasidagi skanerlash motivi bilan bir xil)
const Loader = () => (
    <div className="loader" role="status" aria-live="polite" aria-label="Loading">
        <div className="loader_box">
            <span className="loader_ring"/>
            <span className="loader_ring loader_ring--inner"/>
            <span className="loader_dot"/>
        </div>
    </div>
);

export default Loader;

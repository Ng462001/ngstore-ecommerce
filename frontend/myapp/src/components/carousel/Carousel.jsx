import React from 'react';
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';
import mainCarousel from '../../api/maincarousel';


const items = mainCarousel.map((item, index) => (
    <div key={index} className="px-2 py-4">
        <div className="relative overflow-hidden rounded-2xl shadow-card bg-surface border border-border-light group">
            <img
                src={item.image}
                alt={item.name || `Slide ${index + 1}`}
                className="w-full h-[55vh] min-h-[380px] max-h-[620px] object-cover object-center transition-transform duration-700 group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />
        </div>
    </div>
))

const Carousel = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <AliceCarousel
            autoPlay
            autoPlayInterval={4000}
            animationDuration={800}
            infinite
            items={items}
            controlsStrategy="alternate"
            disableButtonsControls
        />
    </div>
);

export default Carousel;
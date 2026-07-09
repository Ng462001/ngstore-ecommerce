import React from 'react';
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';
import mainCarousel from '../../api/maincarousel';


const items = mainCarousel.map((item, index) => (
    <img
        src={item.image}
        alt={item.name}
        key={index}
        style={{
            width: '100%', height: '90vh', backgroundSize:
                'cover',
            borderRadius: '40px'
        }}

    />
))

const Carousel = () => (
    <AliceCarousel
        autoPlay
        autoPlayInterval={3000}
        animationDuration={1000}
        infinite
        items={items}
        controlsStrategy="alternate"
        disableButtonsControls
    />
);

export default Carousel;
import React from "react";
import AliceCarousel from "react-alice-carousel";
import "react-alice-carousel/lib/alice-carousel.css";
import HomeSection from "../components/HomeSection";
import arrival from "../../api/arrival";

const responsive = {
  0: { items: 1 },
  568: { items: 2 },
  1024: { items: 3 },
  1440: { items: 4 },
};

const items = arrival.map((item, index) => (
  <div
    style={{
      padding: "0 10px",
      boxSizing: "border-box",
      display: "inline-block",
      width: "100%",
    }}
    key={index}
  >
    <HomeSection item={item} />
  </div>
));

const HomeCarousel = () => (
  <div style={{ maxWidth: "1400px", margin: "30px auto" }}>
    <AliceCarousel
      autoPlay
      autoPlayInterval={3000}
      animationDuration={1000}
      infinite
      items={items}
      responsive={responsive}
      disableButtonsControls
      paddingLeft={20}
      paddingRight={20}
    />
  </div>
);

export default HomeCarousel;

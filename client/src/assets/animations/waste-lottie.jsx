import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { animationPath } from "./animationConstants";

const WasteLottie = () => {
  return (
    <DotLottieReact
      src={animationPath}
      loop
      autoplay
    />
  );
};

export default WasteLottie;
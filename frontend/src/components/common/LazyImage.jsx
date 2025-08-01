import React, { useState, useRef, useEffect } from 'react';

const LazyImage = ({ 
  src, 
  alt, 
  className = "", 
  placeholder = "/placeholder.svg",
  onLoad,
  onError,
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageRef, setImageRef] = useState();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    let observer;
    let currentImageRef = imageRef;

    if (currentImageRef) {
      if (IntersectionObserver) {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setIsInView(true);
                observer.unobserve(currentImageRef);
              }
            });
          },
          {
            rootMargin: '50px 0px', // Start loading 50px before the image enters viewport
            threshold: 0.01
          }
        );
        observer.observe(currentImageRef);
      } else {
        // Fallback for browsers that don't support IntersectionObserver
        setIsInView(true);
      }
    }

    return () => {
      if (observer && currentImageRef) {
        observer.unobserve(currentImageRef);
      }
    };
  }, [imageRef]);

  useEffect(() => {
    if (isInView && src) {
      setImageSrc(src);
    }
  }, [isInView, src]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    // Fallback to placeholder if image fails to load
    setImageSrc(placeholder);
    setIsLoaded(true);
    if (onError) onError();
  };

  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      onLoad={handleLoad}
      onError={handleError}
      loading="lazy"
      {...props}
    />
  );
};

export default LazyImage; 
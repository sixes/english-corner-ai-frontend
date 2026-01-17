'use client'

import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import './EmblaCarousel.css'

export default function EmblaCarousel({ slides }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      skipSnaps: false
    },
    [Autoplay({ delay: 4000, stopOnInteraction: true })]
  )
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loadedImages, setLoadedImages] = useState(new Set([0]))

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback(
    (index) => {
      if (emblaApi) emblaApi.scrollTo(index)
    },
    [emblaApi]
  )

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    const index = emblaApi.selectedScrollSnap()
    setSelectedIndex(index)
    
    // Load adjacent images for smooth transitions
    const toLoad = new Set(loadedImages)
    toLoad.add(index)
    if (index > 0) toLoad.add(index - 1)
    if (index < slides.length - 1) toLoad.add(index + 1)
    setLoadedImages(toLoad)
  }, [emblaApi, slides.length, loadedImages])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  return (
    <div className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {slides.map((src, index) => (
            <div className="embla__slide" key={index}>
              {loadedImages.has(index) ? (
                <img
                  src={src}
                  alt={`English Corner ${index + 1}`}
                  className="embla__slide__img"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              ) : (
                <div className="embla__slide__placeholder" />
              )}
            </div>
          ))}
        </div>
      </div>

      <button className="embla__prev" onClick={scrollPrev} aria-label="Previous">
        ‹
      </button>
      <button className="embla__next" onClick={scrollNext} aria-label="Next">
        ›
      </button>

      <div className="embla__dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`embla__dot ${index === selectedIndex ? 'embla__dot--selected' : ''}`}
            onClick={() => scrollTo(index)}
            aria-label={`Go to photo ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

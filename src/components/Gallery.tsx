import { useState } from "react";

type Photo = {
  src: string;
  alt: string;
};

const photos: Photo[] = [
  {
    src: "/images/oceanFeet.jpeg",
    alt: "Riley and Ian's feet in the ocean",
  },
  {
    src: "/images/happyCouple.jpeg",
    alt: "Riley and Ian at the Beach",
  },
  {
    src: "/images/silly.jpeg",
    alt: "Engagement photo",
  },
  {
    src: "/images/petitSoleil.jpeg",
    alt: "Riley and Ian together",
  },
  {
    src: "/images/onTheBar.jpeg",
    alt: "Engagement photo",
  },
  {
    src: "/images/patio.jpeg",
    alt: "Riley and Ian",
  },
];

export default function Gallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selectedPhoto =
    selectedIndex !== null ? photos[selectedIndex] : null;

  function close() {
    setSelectedIndex(null);
  }

  function previous() {
    if (selectedIndex === null) return;

    setSelectedIndex(
      selectedIndex === 0
        ? photos.length - 1
        : selectedIndex - 1
    );
  }

  function next() {
    if (selectedIndex === null) return;

    setSelectedIndex(
      selectedIndex === photos.length - 1
        ? 0
        : selectedIndex + 1
    );
  }

  return (
    <>
      <div className="gallery-grid">
        {photos.map((photo, index) => (
          <button
            className={`gallery-item gallery-item-${index + 1}`}
            key={photo.src}
            onClick={() => setSelectedIndex(index)}
            aria-label={`Open photo ${index + 1}`}
          >
            <img src={photo.src} alt={photo.alt} loading="lazy" />
          </button>
        ))}
      </div>

      {selectedPhoto && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          onClick={close}
        >
          <button
            className="lightbox-close"
            onClick={close}
            aria-label="Close photo viewer"
          >
            ×
          </button>

          <button
            className="lightbox-arrow lightbox-prev"
            onClick={(event) => {
              event.stopPropagation();
              previous();
            }}
            aria-label="Previous photo"
          >
            ←
          </button>

          <img
            src={selectedPhoto.src}
            alt={selectedPhoto.alt}
            className="lightbox-image"
            onClick={(event) => event.stopPropagation()}
          />

          <button
            className="lightbox-arrow lightbox-next"
            onClick={(event) => {
              event.stopPropagation();
              next();
            }}
            aria-label="Next photo"
          >
            →
          </button>
        </div>
      )}
    </>
  );
}
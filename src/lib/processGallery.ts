export const processGalleryImages = [
  { src: '/images/process/process-1.jpg', caption: 'Hand-picking the mangoes' },
  { src: '/images/process/process-2.jpg', caption: 'Sun-drying on the terrace' },
  { src: '/images/process/process-3.jpg', caption: 'Grinding fresh spices' },
  { src: '/images/process/process-4.jpg', caption: 'Cold-pressing mustard oil' },
  { src: '/images/process/process-5.jpg', caption: 'Hand-packing in glass jars' },
  { src: '/images/process/process-6.jpg', caption: 'Sealed with love in Jaipur' },
];

export const PROCESS_GALLERY = processGalleryImages.map(img => ({
  imageUrl: img.src,
  caption: img.caption
}));

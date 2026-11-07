import React, { useEffect, useRef } from 'react';

/**
 * VideoBackground Component
 * 
 * Reusable full-screen HTML5 video background.
 * Manages autoplay, continuous looping, muted audio, and active state transitions.
 *
 * @param {boolean} active - Controls whether the video is mounted and playing
 * @param {string} src - Path/URL to the video file (defaults to '/background/gameover.mp4')
 * @param {string} className - CSS class name for styling
 */
export function VideoBackground({
  active = true,
  src = '/background/gameover.mp4',
  className = 'gameover-video-background'
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure audio is muted for strict browser autoplay compliance
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    if (active) {
      try {
        video.currentTime = 0;
      } catch {
        // ignore seek errors if metadata is still loading
      }

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn('VideoBackground: autoplay deferred or interrupted:', error.message);
        });
      }
    } else {
      video.pause();
      try {
        video.currentTime = 0;
      } catch {}
    }

    return () => {
      if (video) {
        video.pause();
      }
    };
  }, [active, src]);

  // Handle canplay in case video loads asynchronously
  const handleCanPlay = () => {
    if (active && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  };

  if (!active) return null;

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      className={className}
      onCanPlay={handleCanPlay}
    />
  );
}

export default VideoBackground;

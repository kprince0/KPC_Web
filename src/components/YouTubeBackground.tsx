'use client';

import { useEffect, useRef } from 'react';

interface YouTubeBackgroundProps {
  videoId: string;
  startSeconds: number;
  endSeconds: number;
}

export default function YouTubeBackground({ videoId, startSeconds, endSeconds }: YouTubeBackgroundProps) {
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // 1. Load YouTube IFrame API (only once)
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }

    // 2. Initialize Player when API is ready
    const initPlayer = () => {
      playerRef.current = new window.YT.Player('yt-player-bg', {
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          mute: 1,
          start: startSeconds,
          end: endSeconds,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          fs: 0,
          disablekb: 1,
          playsinline: 1,
          iv_load_policy: 3,
        },
        events: {
          onReady: (event: any) => {
            event.target.mute();
            event.target.playVideo();
          },
          onStateChange: (event: any) => {
            // If the video naturally ends/stops, force loop back to start
            if (event.data === window.YT.PlayerState.ENDED || event.data === window.YT.PlayerState.PAUSED) {
              event.target.seekTo(startSeconds);
              event.target.playVideo();
            }
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    // 3. Perfect segment loop enforcement
    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const time = playerRef.current.getCurrentTime();
        if (time >= endSeconds - 0.2) { // 0.2s buffer to prevent showing the next frame
          playerRef.current.seekTo(startSeconds);
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, [videoId, startSeconds, endSeconds]);

  return (
    <div className="absolute inset-0 z-0 w-full h-[150vh] -top-[25vh] overflow-hidden bg-black pointer-events-none select-none">
      <div 
        id="yt-player-bg" 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150vw] aspect-video pointer-events-none"
        style={{ minWidth: '150vw', minHeight: '150vh' }}
      ></div>
    </div>
  );
}

// Add TypeScript types for the YT object globally attached to window
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

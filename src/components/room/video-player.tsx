'use client';

import * as React from 'react';

export default function VideoPlayer({ stream }: { stream: MediaStream }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return <video ref={videoRef} autoPlay />;
}

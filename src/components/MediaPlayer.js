import React, { useRef, useEffect } from "react";

const MediaPlayer = (props) => {
  const container = useRef(null);
  useEffect(() => {
    if (!container.current) return;
    props.videoTrack?.play(container.current);
    return () => {
      props.videoTrack?.stop();
    };
  }, [container, props.videoTrack]);
  useEffect(() => {
    if (props.audioTrack) {
      props.audioTrack?.play();
    }
    return () => {
      props.audioTrack?.stop();
    };
  }, [props.audioTrack]);
  return (
    <div
      ref={container}
      className="video-player"
      style={{ width: "100%", height: "100%", ...props.style }}
    ></div>
  );
};

export default MediaPlayer;

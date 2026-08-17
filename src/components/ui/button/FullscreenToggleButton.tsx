"use client";

import IconButton from "./IconButton";
import { MdFullscreenExit, MdFullscreen } from "react-icons/md";
import { useCallback, useEffect, useState } from "react";

const FullscreenToggleButton: React.FC = () => {
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const updateFullscreenState = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", updateFullscreenState);
    return () => document.removeEventListener("fullscreenchange", updateFullscreenState);
  }, []);

  const toggle = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.error("Unable to toggle fullscreen:", error);
    }
  }, []);

  const icon = fullscreen ? (
    <MdFullscreenExit className="size-full" />
  ) : (
    <MdFullscreen className="size-full" />
  );
  const tooltip = fullscreen ? "Minimize" : "Fullscreen";

  return (
    <IconButton
      tooltip={tooltip}
      tooltipProps={{ placement: "left" }}
      className="p-2"
      icon={icon}
      onPress={() => void toggle()}
      variant="light"
    />
  );
};

export default FullscreenToggleButton;

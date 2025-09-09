import React from "react";
import { Globe } from "lucide-react";

type RotatingGlobeProps = {
  size?: number;
  className?: string;
  src?: string; // allow overriding the asset path if needed
};

export default function RotatingGlobe({ size = 24, className, src = "/assets/dotted-globe.png" }: RotatingGlobeProps) {
  const [imgError, setImgError] = React.useState(false);

  if (imgError) {
    return (
      <Globe
        className={className}
        style={{ width: size, height: size, animation: "spin 12s linear infinite" }}
      />
    );
  }

  return (
    <img
      src={src}
      width={size}
      height={size}
      alt="Rotating dotted globe"
      onError={() => setImgError(true)}
      className={`select-none ${className || ""} dark:invert`}
      style={{ animation: "spin 12s linear infinite" }}
      draggable={false}
    />
  );
}



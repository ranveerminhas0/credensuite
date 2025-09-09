import React from "react";
import { geoOrthographic, geoPath } from "d3-geo";
import { feature } from "topojson-client";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - types not shipped for JSON in this package
import land110m from "world-atlas/land-110m.json";

type DottedGlobeProps = {
  size?: number;
  speedSec?: number;
  className?: string;
  color?: string;
};

export default function DottedGlobe({ size = 24, speedSec = 8, className, color = "currentColor" }: DottedGlobeProps) {
  const ref = React.useRef<SVGPathElement | null>(null);
  const [rotation, setRotation] = React.useState(0);

  // Earth-like rotation animation
  React.useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
    }, speedSec * 1000 / 360); // 360 steps over speedSec seconds

    return () => clearInterval(interval);
  }, [speedSec]);

  React.useEffect(() => {
    const projection = geoOrthographic()
      .translate([size / 2, size / 2])
      .scale(size * 0.48)
      .rotate([rotation, 0, 0]); // Rotate around longitude (left-to-right)

    const path = geoPath(projection as any);

    const land = feature((land110m as any), (land110m as any).objects.land);
    if (ref.current) {
      ref.current.setAttribute("d", path(land as any) || "");
    }
  }, [size, rotation]);

  const patternId = React.useId();
  const maskId = React.useId();

  // Dot sizing tuned for small icons so the dotted look remains visible
  // Higher density: smaller grid cell and dot radius for a finer halftone look
  const cell = Math.max(2, Math.round(size / 10));
  const r = Math.max(0.6, cell * 0.25);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-hidden
      style={{ color }}
    >
      <defs>
        {/* Dot grid pattern */}
        <pattern id={patternId} patternUnits="userSpaceOnUse" width={cell} height={cell}>
          <circle cx={cell / 2} cy={cell / 2} r={r} fill="currentColor" />
        </pattern>
        {/* Mask to clip dots to land */}
        <mask id={maskId} maskUnits="userSpaceOnUse">
          <rect x="0" y="0" width={size} height={size} fill="black" />
          <path ref={ref} fill="white" />
        </mask>
        {/* Rim shading gradient for 3D effect */}
        <radialGradient id={`rim-${patternId}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
          <stop offset="70%" stopColor="currentColor" stopOpacity="0.05" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.15" />
        </radialGradient>
      </defs>

      {/* Sphere outline with rim shading */}
      <circle 
        cx={size / 2} 
        cy={size / 2} 
        r={size * 0.48} 
        fill={`url(#rim-${patternId})`}
        stroke="currentColor" 
        strokeWidth={size * 0.02} 
        opacity={0.2} 
      />

      {/* Dotted land (no CSS rotation - using projection rotation instead) */}
      <rect x="0" y="0" width={size} height={size} fill={`url(#${patternId})`} mask={`url(#${maskId})`} />
    </svg>
  );
}



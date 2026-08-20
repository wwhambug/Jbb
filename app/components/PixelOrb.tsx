import { memo } from "react";
import { getPixelStyle, matrixSize, pixelCss } from "../game/pixel-art";
import type { VariantId } from "../game/types";

type PixelOrbProps = {
  fighterId: string;
  color: string;
  ink: string;
  size: number;
  variant?: VariantId;
  ultimate?: boolean;
  showItem?: boolean;
  className?: string;
};

export const PixelOrb = memo(function PixelOrb({
  fighterId,
  color,
  ink,
  size,
  variant = "classic",
  ultimate = false,
  showItem = true,
  className = "",
}: PixelOrbProps) {
  const style = getPixelStyle(fighterId);
  const face = ultimate && style.ultimateFace ? style.ultimateFace : style.face;
  const faceScale = size >= 72 ? 2 : 1;
  const itemScale = size >= 72 ? 2 : 1;
  const faceSize = matrixSize(face);
  const itemSize = matrixSize(style.item);
  const faceDot = pixelCss(face, style, faceScale);
  const itemDot = pixelCss(style.item, style, itemScale);

  return (
    <span
      className={`pixel-orb variant-${variant}${ultimate ? " ultimate" : ""}${className ? ` ${className}` : ""}`}
      style={{ width: size, height: size, backgroundColor: color, color: ink }}
      aria-hidden="true"
    >
      <span
        className="pixel-face"
        style={{ width: faceSize.width * faceScale, height: faceSize.height * faceScale }}
      >
        <i style={faceDot} />
      </span>
      {showItem ? (
        <span
          className="pixel-item"
          style={{
            width: itemSize.width * itemScale,
            height: itemSize.height * itemScale,
            transform: `translate(${Math.round(size * 0.32)}px, ${Math.round(size * -0.28)}px) rotate(-18deg)`,
          }}
        >
          <i style={itemDot} />
        </span>
      ) : null}
    </span>
  );
});

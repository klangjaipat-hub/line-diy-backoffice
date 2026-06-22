import { BannerTemplate } from "./data";

// Renders a scaled, representative preview of a banner for a given template.
// Real banner sizes (e.g. 2880px) are scaled down to fit the available width
// while keeping the template's aspect ratio. `maxWidth` caps the rendered width
// so the same component works in a wide page or a narrow side panel.

export function BannerPreview({
  template,
  contentType,
  title,
  description,
  bgImageDataUrl,
  imageDataUrl,
  imageName,
  maxWidth = 760,
}: {
  template: BannerTemplate;
  contentType: "text" | "image";
  title?: string;
  description?: string;
  bgImageDataUrl?: string;
  imageDataUrl?: string;
  imageName?: string;
  maxWidth?: number;
}) {
  const aspect = template.width / template.height;
  const renderWidth = Math.min(template.width, maxWidth);
  const naturalHeight = renderWidth / aspect;
  // Text banners get a minimum height so ultra-wide bars stay readable.
  const boxHeight = contentType === "text" ? Math.max(naturalHeight, 72) : naturalHeight;

  const titleSize = Math.max(13, Math.min(26, boxHeight * 0.3));
  const descSize = Math.max(11, Math.min(16, boxHeight * 0.18));
  const hasBgImage = contentType === "text" && !!bgImageDataUrl;

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div
        className="relative border border-[#e0e0e0] rounded overflow-hidden drop-shadow-[0px_2px_4px_rgba(0,0,0,0.12)] flex items-center justify-center"
        style={{
          width: renderWidth,
          height: boxHeight,
          maxWidth: "100%",
          backgroundColor: "#f4f4f4",
        }}
      >
        {contentType === "text" ? (
          <>
            {/* Optional background image + scrim for legibility */}
            {hasBgImage && (
              <>
                <img src={bgImageDataUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/35" />
              </>
            )}
            <div className="relative flex flex-col items-center justify-center text-center px-6 gap-1 overflow-hidden">
              <span
                className="font-['Prompt',sans-serif] font-semibold leading-tight"
                style={{ color: hasBgImage ? "#ffffff" : "#111827", fontSize: titleSize }}
              >
                {title || "หัวข้อแบนเนอร์"}
              </span>
              <span
                className="font-['Prompt',sans-serif] leading-tight"
                style={{ color: hasBgImage ? "rgba(255,255,255,0.9)" : "#6b7280", fontSize: descSize }}
              >
                {description || "รายละเอียดแบนเนอร์"}
              </span>
            </div>
          </>
        ) : imageDataUrl ? (
          <img src={imageDataUrl} alt={imageName || "banner"} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-[#9ca3af]">
            <span className="font-['Prompt',sans-serif] text-[14px]">{imageName || "Image Preview"}</span>
            <span className="font-['Prompt',sans-serif] text-[12px]">{template.size}</span>
          </div>
        )}
      </div>
      <span className="font-['Prompt',sans-serif] text-[12px] text-[#9ca3af] text-center">
        {template.name} · {template.size} · {template.position}
      </span>
    </div>
  );
}

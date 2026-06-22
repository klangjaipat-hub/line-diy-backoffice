import { BannerTemplate } from "./data";

// A small website wireframe that shows WHERE the selected template's banner
// will appear on the screen. The active slot is highlighted; the others are
// shown faintly so the admin can see all possible positions in context.

// Maps each template id to a placement slot in the wireframe.
type Slot = "top" | "aboveContent" | "belowSideMenu" | "besideDrawer" | "bottom";

const TEMPLATE_SLOT: Record<string, Slot> = {
  "1": "top",
  "2": "aboveContent",
  "3": "belowSideMenu",
  "4": "besideDrawer",
  "5": "bottom",
};

function SlotBox({
  active,
  label,
  className = "",
  style,
}: {
  active: boolean;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-[3px] overflow-hidden ${
        active
          ? "bg-[#00bb03] text-white drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]"
          : "border border-dashed border-[#d1d5db] bg-white/40"
      } ${className}`}
      style={style}
    >
      {active && label && (
        <span className="font-['Prompt',sans-serif] text-[9px] font-semibold leading-none text-center px-1 truncate">
          {label}
        </span>
      )}
    </div>
  );
}

export function ScreenPlacementPreview({
  template,
  showCaption = true,
  minHeight = 220,
}: {
  template: BannerTemplate;
  showCaption?: boolean;
  minHeight?: number;
}) {
  const slot = TEMPLATE_SLOT[template.id];
  const label = template.name;

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {/* Browser/window frame */}
      <div className="w-full rounded-md border border-[#e0e0e0] bg-[#f9fafb] overflow-hidden">
        {/* window dots bar */}
        <div className="flex items-center gap-1 px-2 py-1 bg-[#eceef1] border-b border-[#e0e0e0]">
          <span className="size-1.5 rounded-full bg-[#dc3f5a]" />
          <span className="size-1.5 rounded-full bg-[#F89F24]" />
          <span className="size-1.5 rounded-full bg-[#00bb03]" />
        </div>

        <div className="p-2 flex flex-col gap-1.5" style={{ minHeight }}>
          {/* Top of Screen (Banner Ads 1) */}
          <SlotBox active={slot === "top"} label={label} className="w-full" style={{ height: 16 }} />

          {/* Site header */}
          <div className="w-full bg-[#dfe3e8] rounded-[3px] flex items-center px-2" style={{ height: 18 }}>
            <span className="size-2 rounded-full bg-[#b8bec7]" />
            <span className="ml-1 h-1.5 w-10 rounded bg-[#b8bec7]" />
          </div>

          {/* Body: side menu + content + drawer */}
          <div className="flex gap-1.5 flex-1" style={{ minHeight: 120 }}>
            {/* Side menu */}
            <div className="w-[26%] flex flex-col gap-1">
              <div className="h-1.5 w-full rounded bg-[#dfe3e8]" />
              <div className="h-1.5 w-4/5 rounded bg-[#dfe3e8]" />
              <div className="h-1.5 w-4/5 rounded bg-[#dfe3e8]" />
              <div className="h-1.5 w-3/5 rounded bg-[#dfe3e8]" />
              {/* Below Side Menu (Banner Ads 3) */}
              <SlotBox
                active={slot === "belowSideMenu"}
                label={label}
                className="w-full mt-auto"
                style={{ height: 44 }}
              />
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col gap-1">
              {/* Above Content Area (Banner Ads 2) */}
              <SlotBox active={slot === "aboveContent"} label={label} className="w-full" style={{ height: 16 }} />
              <div className="h-1.5 w-3/4 rounded bg-[#dfe3e8]" />
              <div className="h-1.5 w-full rounded bg-[#e6e9ed]" />
              <div className="h-1.5 w-full rounded bg-[#e6e9ed]" />
              <div className="h-1.5 w-5/6 rounded bg-[#e6e9ed]" />
              <div className="grid grid-cols-2 gap-1 mt-1">
                <div className="h-8 rounded bg-[#e6e9ed]" />
                <div className="h-8 rounded bg-[#e6e9ed]" />
              </div>
            </div>

            {/* Beside Side Drawer (Banner Ads 4) */}
            <div className="w-[20%] flex flex-col">
              <SlotBox
                active={slot === "besideDrawer"}
                label={label}
                className="w-full flex-1"
              />
            </div>
          </div>

          {/* Bottom of Screen (Banner Ads 5) */}
          <SlotBox active={slot === "bottom"} label={label} className="w-full" style={{ height: 16 }} />
        </div>
      </div>
      {showCaption && (
        <span className="font-['Prompt',sans-serif] text-[12px] text-[#9ca3af] text-center">
          ตำแหน่งบนหน้าจอ: {template.position}
        </span>
      )}
    </div>
  );
}

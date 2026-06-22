import { X, FileCheck, Megaphone, LucideIcon } from "lucide-react";

export type FeatureKey = "tax-agent" | "banner-ads";

interface MenuItem {
  key: FeatureKey;
  label: string;
  sublabel: string;
  icon: LucideIcon;
}

const MENU_ITEMS: MenuItem[] = [
  { key: "tax-agent", label: "Tax Agent", sublabel: "ตัวแทนหักภาษี ณ ที่จ่าย", icon: FileCheck },
  { key: "banner-ads", label: "Marketing Tools", sublabel: "Banner Ads", icon: Megaphone },
];

export function Sidebar({
  open,
  active,
  onSelect,
  onClose,
}: {
  open: boolean;
  active: FeatureKey;
  onSelect: (key: FeatureKey) => void;
  onClose: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-40 w-[300px] bg-white drop-shadow-[4px_0px_8px_rgba(0,0,0,0.15)] flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e7eb]">
          <span className="font-['Prompt',sans-serif] text-[20px] font-semibold text-black">
            เมนู
          </span>
          <button
            onClick={onClose}
            className="size-8 flex items-center justify-center text-[#757575] hover:text-gray-600 transition-colors"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu items */}
        <nav className="flex flex-col gap-1 p-4">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  onSelect(item.key);
                  onClose();
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  isActive
                    ? "bg-green-50 text-[#00bb03]"
                    : "text-black hover:bg-gray-50"
                }`}
              >
                <Icon size={22} className={isActive ? "text-[#00bb03]" : "text-[#757575]"} />
                <span className="flex flex-col">
                  <span
                    className={`font-['Prompt',sans-serif] text-[16px] ${
                      isActive ? "font-bold" : "font-normal"
                    }`}
                  >
                    {item.label}
                  </span>
                  <span className="font-['Prompt',sans-serif] text-[12px] text-[#9ca3af]">
                    {item.sublabel}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

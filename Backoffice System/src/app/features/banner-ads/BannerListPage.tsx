import { useState } from "react";
import { Plus, Pencil, Megaphone } from "lucide-react";
import { StatusBadge } from "@/app/components/common";
import { Banner, BannerStatus, STATUS_LABEL, STATUS_VARIANT } from "./data";

type TabKey = "active" | "unpublished";

const TABS: { key: TabKey; label: string }[] = [
  { key: "active", label: "เผยแพร่ & ฉบับร่าง" },
  { key: "unpublished", label: "หยุดเผยแพร่" },
];

// Which statuses each tab includes.
const TAB_STATUSES: Record<TabKey, BannerStatus[]> = {
  active: ["published", "draft"],
  unpublished: ["unpublished"],
};

export function BannerListPage({
  banners,
  onCreate,
  onEdit,
  onRowClick,
}: {
  banners: Banner[];
  onCreate: () => void;
  onEdit: (banner: Banner) => void;
  onRowClick: (banner: Banner) => void;
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("active");

  // Filter by the active status tab, then sort most-recent → oldest (DD-MM-YYYY).
  const sorted = banners
    .filter((b) => TAB_STATUSES[activeTab].includes(b.status))
    .sort((a, b) => {
      const toKey = (d: string) => d.split("-").reverse().join(""); // YYYYMMDD
      return toKey(b.date).localeCompare(toKey(a.date));
    });

  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <div className="px-12 py-6 flex flex-col gap-4">
        <div className="bg-white drop-shadow-[0px_2px_2px_rgba(0,0,0,0.25)] rounded flex flex-col gap-4 p-6">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <h1 className="font-['Prompt',sans-serif] text-[36px] text-black leading-normal">
              Marketing Tools
            </h1>
            <button
              onClick={onCreate}
              className="flex items-center gap-2 bg-[#00bb03] text-white font-['Prompt',sans-serif] text-[16px] px-6 py-2 rounded-[32px] hover:bg-green-600 transition-colors"
            >
              <Plus size={18} />
              Create Banner Ads
            </button>
          </div>

          {/* Status tabs */}
          <div className="flex items-start border-b border-[#e5e7eb]">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-[10px] relative font-['Prompt',sans-serif] text-[16px] whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? "text-[#00bb03] font-bold border-b-2 border-[#00bb03]"
                    : "text-[#666] font-normal"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {sorted.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center gap-4 py-24">
              <div className="size-16 rounded-full bg-[#f4f4f4] flex items-center justify-center">
                <Megaphone size={32} className="text-[#9ca3af]" />
              </div>
              <p className="font-['Prompt',sans-serif] text-[18px] text-[#6b7280]">
                {activeTab === "unpublished" ? "No Unpublished banners" : "No Published or Draft banners"}
              </p>
              <button
                onClick={onCreate}
                className="flex items-center gap-2 bg-[#00bb03] text-white font-['Prompt',sans-serif] text-[16px] px-6 py-2 rounded-[32px] hover:bg-green-600 transition-colors"
              >
                <Plus size={18} />
                Create Banner Ads
              </button>
            </div>
          ) : (
            /* Table */
            <div className="bg-white drop-shadow-[0px_0px_2px_rgba(0,0,0,0.25)] w-full overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                    <th className="text-left px-6 py-3 font-['Prompt',sans-serif] font-semibold text-[12px] text-[#6b7280] leading-[22px] whitespace-nowrap w-[200px]">
                      Date
                    </th>
                    <th className="text-left px-6 py-3 font-['Prompt',sans-serif] font-semibold text-[12px] text-[#6b7280] leading-[22px] whitespace-nowrap">
                      Banner Ads Name
                    </th>
                    <th className="text-center px-4 py-3 font-['Prompt',sans-serif] font-semibold text-[12px] text-[#6b7280] leading-[22px] whitespace-nowrap w-[200px]">
                      Status
                    </th>
                    <th className="text-center px-4 py-3 font-['Prompt',sans-serif] font-semibold text-[12px] text-[#6b7280] leading-[22px] whitespace-nowrap w-[120px]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((banner) => (
                    <tr
                      key={banner.id}
                      className="border-b border-[#e5e7eb] hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => onRowClick(banner)}
                    >
                      <td className="h-[52px] px-6 py-3">
                        <span className="font-['Prompt',sans-serif] text-[14px] text-black leading-[22px]">
                          {banner.date}
                        </span>
                      </td>
                      <td className="h-[52px] px-6 py-3">
                        <span className="font-['Prompt',sans-serif] text-[14px] text-black leading-[22px]">
                          {banner.name}
                        </span>
                      </td>
                      <td className="h-[52px] px-4 py-3 text-center">
                        <StatusBadge
                          label={STATUS_LABEL[banner.status]}
                          variant={STATUS_VARIANT[banner.status]}
                        />
                      </td>
                      <td className="h-[52px] px-4 py-3">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(banner);
                            }}
                            className="text-[#00bb03] hover:text-green-700 transition-colors"
                            aria-label="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

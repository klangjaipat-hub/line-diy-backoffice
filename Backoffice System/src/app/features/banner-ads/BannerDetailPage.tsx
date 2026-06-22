import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { StatusBadge, ConfirmDialog } from "@/app/components/common";
import { BannerPreview } from "./BannerPreview";
import { ScreenPlacementPreview } from "./ScreenPlacementPreview";
import { Banner, getTemplate, isoToDisplay, STATUS_LABEL, STATUS_VARIANT } from "./data";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="font-['Prompt',sans-serif] text-[14px] text-[#6b7280]">{label}</p>
      <p className="font-['Prompt',sans-serif] text-[16px] text-black font-medium break-words">
        {value || "—"}
      </p>
    </div>
  );
}

export function BannerDetailPage({
  banner,
  onBack,
  onEdit,
  onUnpublish,
  onPublish,
}: {
  banner: Banner;
  onBack: () => void;
  onEdit: (banner: Banner) => void;
  onUnpublish: (banner: Banner) => void;
  onPublish: (banner: Banner) => void;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const template = getTemplate(banner.templateId);

  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <div className="px-12 py-6 flex flex-col gap-4 max-w-[1000px]">
        {/* Back + action row */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <ArrowLeft size={20} className="text-black" />
            <span className="font-['Prompt',sans-serif] text-[16px] text-black">กลับ</span>
          </button>

          <div className="flex items-center gap-3">
            {/* Edit available for any status */}
            <button
              onClick={() => onEdit(banner)}
              className="min-w-[120px] px-6 py-2 rounded-[32px] font-['Prompt',sans-serif] text-[16px] text-black border border-[#e0e0e0] hover:bg-gray-50 transition-colors"
            >
              แก้ไข
            </button>

            {/* Publish for Draft / Unpublished */}
            {banner.status !== "published" && (
              <button
                onClick={() => setShowPublishConfirm(true)}
                className="min-w-[150px] px-6 py-2 rounded-[32px] font-['Prompt',sans-serif] text-[16px] text-white bg-[#00bb03] hover:bg-green-600 transition-colors"
              >
                เผยแพร่
              </button>
            )}

            {/* Unpublish for Published */}
            {banner.status === "published" && (
              <button
                onClick={() => setShowConfirm(true)}
                className="min-w-[150px] px-6 py-2 rounded-[32px] font-['Prompt',sans-serif] text-[16px] text-[#dc3f5a] border border-[#dc3f5a] hover:bg-red-50 transition-colors"
              >
                หยุดเผยแพร่
              </button>
            )}
          </div>
        </div>

        {/* Title + status */}
        <div className="flex items-center gap-4">
          <h1 className="font-['Prompt',sans-serif] text-[32px] text-black leading-normal">
            {banner.name}
          </h1>
          <StatusBadge label={STATUS_LABEL[banner.status]} variant={STATUS_VARIANT[banner.status]} />
        </div>

        <div className="bg-white drop-shadow-[0px_2px_2px_rgba(0,0,0,0.25)] rounded flex flex-col gap-6 p-8">
          {/* Detail fields */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            <Field label="Banner Ads Name" value={banner.name} />
            <Field
              label="Template"
              value={template ? `${template.name} — ${template.size} · ${template.position}` : "—"}
            />
            <Field label="Start Date" value={isoToDisplay(banner.startDate)} />
            <Field label="End Date" value={isoToDisplay(banner.endDate)} />
            <Field label="Content Type" value={template?.contentType === "image" ? "Image" : "Text"} />
            <Field label="Created / Updated" value={banner.date} />
            <div className="col-span-2">
              <p className="font-['Prompt',sans-serif] text-[14px] text-[#6b7280] mb-0.5">URL Link</p>
              {banner.urlLink ? (
                <a
                  href={banner.urlLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-['Prompt',sans-serif] text-[16px] text-[#00bb03] underline break-all"
                >
                  {banner.urlLink}
                </a>
              ) : (
                <p className="font-['Prompt',sans-serif] text-[16px] text-black">—</p>
              )}
            </div>

            {template?.contentType === "text" && (
              <>
                <Field label="Title" value={banner.title} />
                <Field label="Description" value={banner.description} />
                <Field label="Background Image" value={banner.bgImageName} />
              </>
            )}
            {template?.contentType === "image" && (
              <Field label="Image" value={banner.imageName} />
            )}
          </div>

          {/* Preview: banner appearance + placement on screen */}
          {template && (
            <div className="border-t border-[#e5e7eb] pt-6 flex flex-col gap-4">
              <h3 className="font-['Prompt',sans-serif] text-[20px] font-semibold text-black">
                Preview
              </h3>
              <div className="grid grid-cols-2 gap-6 items-start">
                <div className="flex flex-col gap-2">
                  <span className="font-['Prompt',sans-serif] text-[13px] font-semibold text-[#6b7280]">
                    1. ตัวอย่างแบนเนอร์
                  </span>
                  <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded p-4 flex items-center justify-center min-h-[140px]">
                    <BannerPreview
                      template={template}
                      contentType={template.contentType}
                      title={banner.title}
                      description={banner.description}
                      bgImageDataUrl={banner.bgImageDataUrl}
                      imageDataUrl={banner.imageDataUrl}
                      imageName={banner.imageName}
                      maxWidth={420}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-['Prompt',sans-serif] text-[13px] font-semibold text-[#6b7280]">
                    2. ตำแหน่งที่จะแสดงบนหน้าจอ
                  </span>
                  <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded p-4 flex items-center justify-center">
                    <ScreenPlacementPreview template={template} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="ยืนยันการหยุดเผยแพร่?"
        message="แบนเนอร์จะถูกนำออกจากหน้าเว็บทันที และเปลี่ยนสถานะเป็น Unpublished"
        confirmLabel="ยืนยัน"
        cancelLabel="ยกเลิก"
        confirmVariant="danger"
        onConfirm={() => {
          setShowConfirm(false);
          onUnpublish(banner);
        }}
        onCancel={() => setShowConfirm(false)}
      />

      <ConfirmDialog
        open={showPublishConfirm}
        title="ยืนยันการเผยแพร่?"
        message="แบนเนอร์จะแสดงบนหน้าเว็บทันทีหลังยืนยัน และเปลี่ยนสถานะเป็น Published"
        confirmLabel="เผยแพร่"
        cancelLabel="ยกเลิก"
        confirmVariant="primary"
        onConfirm={() => {
          setShowPublishConfirm(false);
          onPublish(banner);
        }}
        onCancel={() => setShowPublishConfirm(false)}
      />
    </div>
  );
}

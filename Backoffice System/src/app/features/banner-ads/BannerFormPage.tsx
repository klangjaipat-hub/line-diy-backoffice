import { useState, useRef } from "react";
import { Check, Upload, AlertCircle, Eye, ArrowLeft } from "lucide-react";
import { ConfirmDialog } from "@/app/components/common";
import { BannerPreview } from "./BannerPreview";
import { ScreenPlacementPreview } from "./ScreenPlacementPreview";
import {
  Banner,
  BannerStatus,
  TEMPLATES,
  getTemplate,
  hasEmoji,
  isValidUrl,
  isAllowedImage,
  MAX_IMAGE_BYTES,
  wouldExceedTemplateLimit,
} from "./data";

interface FormErrors {
  name?: string;
  templateId?: string;
  startDate?: string;
  endDate?: string;
  urlLink?: string;
  title?: string;
  description?: string;
  bgImage?: string;
  image?: string;
}

// Small inline error line.
function ErrorText({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <span className="flex items-center gap-1 font-['Prompt',sans-serif] text-[12px] text-[#dc3f5a]">
      <AlertCircle size={13} />
      {msg}
    </span>
  );
}

const labelCls = "font-['Prompt',sans-serif] text-[16px] text-black font-medium";
const reqStar = <span className="text-[#dc3f5a]"> *</span>;

export function BannerFormPage({
  existing,
  banners,
  onSaveDraft,
  onPublish,
  onCancel,
}: {
  existing?: Banner;
  banners: Banner[];
  onSaveDraft: (data: Omit<Banner, "id" | "status" | "date">) => void;
  onPublish: (data: Omit<Banner, "id" | "status" | "date">) => void;
  onCancel: () => void;
}) {
  const isEdit = !!existing;
  const wasPublished = existing?.status === "published";

  const [name, setName] = useState(existing?.name ?? "");
  const [templateId, setTemplateId] = useState(existing?.templateId ?? "");
  const [startDate, setStartDate] = useState(existing?.startDate ?? "");
  const [endDate, setEndDate] = useState(existing?.endDate ?? "");
  const [urlLink, setUrlLink] = useState(existing?.urlLink ?? "");
  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [bgImageName, setBgImageName] = useState(existing?.bgImageName ?? "");
  const [bgImageDataUrl, setBgImageDataUrl] = useState(existing?.bgImageDataUrl ?? "");
  const [imageName, setImageName] = useState(existing?.imageName ?? "");
  const [imageDataUrl, setImageDataUrl] = useState(existing?.imageDataUrl ?? "");

  const [errors, setErrors] = useState<FormErrors>({});
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const bgFileRef = useRef<HTMLInputElement>(null);

  const template = templateId ? getTemplate(templateId) : undefined;
  const contentType = template?.contentType;

  // ─── Inline validators (run on change) ──────────────────────────────────────

  function handleTitleChange(v: string) {
    setTitle(v);
    setErrors((e) => ({ ...e, title: hasEmoji(v) ? "ไม่รองรับอีโมจิ (emoji)" : undefined }));
  }
  function handleDescChange(v: string) {
    setDescription(v);
    setErrors((e) => ({ ...e, description: hasEmoji(v) ? "ไม่รองรับอีโมจิ (emoji)" : undefined }));
  }
  function handleUrlChange(v: string) {
    setUrlLink(v);
    setErrors((e) => ({ ...e, urlLink: isValidUrl(v) ? undefined : "รูปแบบ URL ไม่ถูกต้อง" }));
  }

  // V-03: template selection respects the 2-active-template limit.
  function handleSelectTemplate(id: string) {
    if (
      wouldExceedTemplateLimit(banners, id, startDate, endDate, existing?.id)
    ) {
      setErrors((e) => ({
        ...e,
        templateId: "ช่วงเวลานี้มี Template ใช้งานครบ 2 รายการแล้ว",
      }));
      return;
    }
    setTemplateId(id);
    setErrors((e) => ({ ...e, templateId: undefined }));
  }

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!isAllowedImage(file)) {
      setErrors((e) => ({ ...e, image: "รองรับเฉพาะไฟล์ .jpg / .jpeg" }));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setErrors((e) => ({ ...e, image: "ขนาดไฟล์ต้องไม่เกิน 20 MB" }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(String(reader.result));
      setImageName(file.name);
      setErrors((e) => ({ ...e, image: undefined }));
    };
    reader.readAsDataURL(file);
  }

  // Optional background image for text banners (same .jpg/.jpeg, 20 MB rules).
  function handleBgFile(file: File | undefined) {
    if (!file) return;
    if (!isAllowedImage(file)) {
      setErrors((e) => ({ ...e, bgImage: "รองรับเฉพาะไฟล์ .jpg / .jpeg" }));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setErrors((e) => ({ ...e, bgImage: "ขนาดไฟล์ต้องไม่เกิน 20 MB" }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setBgImageDataUrl(String(reader.result));
      setBgImageName(file.name);
      setErrors((e) => ({ ...e, bgImage: undefined }));
    };
    reader.readAsDataURL(file);
  }

  function clearBgImage() {
    setBgImageDataUrl("");
    setBgImageName("");
    setErrors((e) => ({ ...e, bgImage: undefined }));
    if (bgFileRef.current) bgFileRef.current.value = "";
  }

  // ─── Full validation (V-01 … V-06) on Save / Publish / Preview ───────────────

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!name.trim()) e.name = "กรุณากรอกชื่อ Banner Ads"; // V-06
    if (!templateId) e.templateId = "กรุณาเลือก Template"; // V-06
    if (!startDate) e.startDate = "กรุณาเลือกวันที่เริ่ม"; // V-06
    if (!endDate) e.endDate = "กรุณาเลือกวันที่สิ้นสุด"; // V-06
    if (startDate && endDate && endDate <= startDate)
      e.endDate = "วันที่สิ้นสุดต้องมากกว่าวันที่เริ่ม"; // V-05
    if (urlLink && !isValidUrl(urlLink)) e.urlLink = "รูปแบบ URL ไม่ถูกต้อง"; // V-04

    if (contentType === "text") {
      if (!title.trim()) e.title = "กรุณากรอกหัวข้อ"; // V-06
      else if (hasEmoji(title)) e.title = "ไม่รองรับอีโมจิ (emoji)"; // V-01
      if (!description.trim()) e.description = "กรุณากรอกรายละเอียด"; // V-06
      else if (hasEmoji(description)) e.description = "ไม่รองรับอีโมจิ (emoji)"; // V-01
    }
    if (contentType === "image") {
      if (!imageDataUrl && !imageName) e.image = "กรุณาอัปโหลดรูปภาพ"; // V-06
    }
    // V-03 (re-check at submit)
    if (
      templateId &&
      wouldExceedTemplateLimit(banners, templateId, startDate, endDate, existing?.id)
    ) {
      e.templateId = "ช่วงเวลานี้มี Template ใช้งานครบ 2 รายการแล้ว";
    }
    return e;
  }

  function buildData(): Omit<Banner, "id" | "status" | "date"> {
    return {
      name: name.trim(),
      templateId,
      startDate,
      endDate,
      urlLink: urlLink.trim(),
      title: contentType === "text" ? title : "",
      description: contentType === "text" ? description : "",
      bgImageName: contentType === "text" ? bgImageName : "",
      bgImageDataUrl: contentType === "text" ? bgImageDataUrl : "",
      imageName: contentType === "image" ? imageName : "",
      imageDataUrl: contentType === "image" ? imageDataUrl : "",
    };
  }

  function runValidated(action: () => void) {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length === 0) action();
  }

  function handleSave() {
    runValidated(() => onSaveDraft(buildData()));
  }

  function handlePublishClick() {
    // Publishing always requires a confirmation modal (Draft → Published, or
    // re-publishing an edited Published banner whose original stays live until
    // the update is confirmed).
    runValidated(() => setShowPublishConfirm(true));
  }

  // ─── Form mode (two columns: fields + live preview) ──────────────────────────

  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <div className="px-12 py-6 flex flex-col gap-4">
        {/* Back */}
        <button
          onClick={() => setShowCancelConfirm(true)}
          className="flex items-center gap-2 hover:opacity-70 transition-opacity w-max"
        >
          <ArrowLeft size={20} className="text-black" />
          <span className="font-['Prompt',sans-serif] text-[16px] text-black">กลับ</span>
        </button>

        {/* Title */}
        <div className="flex items-center justify-between">
          <h1 className="font-['Prompt',sans-serif] text-[32px] text-black leading-normal">
            {isEdit ? "Edit Banner Ads" : "Create Banner Ads"}
          </h1>
        </div>

        {wasPublished && (
          <div className="bg-[#fef9c3] border border-[#fde68a] rounded px-4 py-2 max-w-[720px]">
            <span className="font-['Prompt',sans-serif] text-[14px] text-[#92400e]">
              แบนเนอร์นี้กำลังเผยแพร่อยู่ — การแก้ไขจะถูกบันทึกเป็น Draft ก่อน
              แบนเนอร์เดิมจะยังแสดงบนหน้าเว็บจนกว่าจะกด Publish เพื่อยืนยัน
            </span>
          </div>
        )}

        <div className="flex items-start gap-6">
          {/* LEFT — form fields */}
          <div className="flex-1 min-w-0 max-w-[720px] bg-white drop-shadow-[0px_2px_2px_rgba(0,0,0,0.25)] rounded flex flex-col gap-6 p-8">
          {/* Banner name */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Banner Ads Name{reqStar}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ชื่อ Banner Ads"
              className={`bg-[#f3f3f5] rounded px-4 py-2.5 font-['Prompt',sans-serif] text-[16px] outline-none border ${
                errors.name ? "border-[#dc3f5a]" : "border-transparent focus:border-[#00bb03]"
              }`}
            />
            <ErrorText msg={errors.name} />
          </div>

          {/* Template select — card grid with on-screen placement preview */}
          <div className="flex flex-col gap-2">
            <label className={labelCls}>Template{reqStar}</label>
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATES.map((t) => {
                const selected = templateId === t.id;
                const locked =
                  !selected &&
                  wouldExceedTemplateLimit(banners, t.id, startDate, endDate, existing?.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    disabled={locked}
                    onClick={() => handleSelectTemplate(t.id)}
                    className={`relative text-left rounded-lg border p-3 flex flex-col gap-2 transition-colors ${
                      selected
                        ? "border-[#00bb03] bg-green-50 ring-1 ring-[#00bb03]"
                        : locked
                        ? "border-[#e5e7eb] bg-[#f9fafb] opacity-60 cursor-not-allowed"
                        : "border-[#e0e0e0] bg-white hover:border-[#00bb03] hover:bg-green-50/40"
                    }`}
                  >
                    {/* selected check */}
                    {selected && (
                      <span className="absolute right-2 top-2 size-5 rounded-full bg-[#00bb03] flex items-center justify-center">
                        <Check size={13} className="text-white" />
                      </span>
                    )}
                    <ScreenPlacementPreview template={t} showCaption={false} minHeight={120} />
                    <div className="flex flex-col">
                      <span className="font-['Prompt',sans-serif] text-[15px] font-medium text-black">
                        {t.name}{" "}
                        <span className="text-[#9ca3af] font-normal">
                          ({t.contentType === "text" ? "Text" : "Image"})
                        </span>
                      </span>
                      <span className="font-['Prompt',sans-serif] text-[12px] text-[#9ca3af]">
                        {t.size} · {t.position}
                      </span>
                      {locked && (
                        <span className="font-['Prompt',sans-serif] text-[11px] text-[#dc3f5a] mt-0.5">
                          ช่วงเวลานี้มี Template ครบ 2 รายการแล้ว
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <ErrorText msg={errors.templateId} />
          </div>

          {/* Display period */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Display Period{reqStar}</label>
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1 flex-1">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`bg-[#f3f3f5] rounded px-4 py-2.5 font-['Prompt',sans-serif] text-[16px] outline-none border w-full ${
                    errors.startDate ? "border-[#dc3f5a]" : "border-transparent focus:border-[#00bb03]"
                  }`}
                />
                <ErrorText msg={errors.startDate} />
              </div>
              <span className="font-['Prompt',sans-serif] text-[16px] text-[#6b7280]">–</span>
              <div className="flex flex-col gap-1 flex-1">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`bg-[#f3f3f5] rounded px-4 py-2.5 font-['Prompt',sans-serif] text-[16px] outline-none border w-full ${
                    errors.endDate ? "border-[#dc3f5a]" : "border-transparent focus:border-[#00bb03]"
                  }`}
                />
                <ErrorText msg={errors.endDate} />
              </div>
            </div>
            <span className="font-['Prompt',sans-serif] text-[12px] text-[#9ca3af]">
              เมื่อถึงวันที่สิ้นสุด ระบบจะเปลี่ยนสถานะเป็น "Unpublished" อัตโนมัติ
            </span>
          </div>

          {/* URL link */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>URL Link</label>
            <input
              value={urlLink}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example.com"
              className={`bg-[#f3f3f5] rounded px-4 py-2.5 font-['Prompt',sans-serif] text-[16px] outline-none border ${
                errors.urlLink ? "border-[#dc3f5a]" : "border-transparent focus:border-[#00bb03]"
              }`}
            />
            <ErrorText msg={errors.urlLink} />
            <span className="font-['Prompt',sans-serif] text-[12px] text-[#9ca3af]">
              ลิงก์จะเปิดในแท็บใหม่ (Optional)
            </span>
          </div>

          {/* Content section (depends on template type) */}
          {contentType && (
            <div className="border-t border-[#e5e7eb] pt-6 flex flex-col gap-6">
              <h3 className="font-['Prompt',sans-serif] text-[20px] font-semibold text-black">
                Content — {contentType === "text" ? "Text" : "Image"}
              </h3>

              {contentType === "text" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Title{reqStar}</label>
                    <input
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="หัวข้อแบนเนอร์"
                      className={`bg-[#f3f3f5] rounded px-4 py-2.5 font-['Prompt',sans-serif] text-[16px] outline-none border ${
                        errors.title ? "border-[#dc3f5a]" : "border-transparent focus:border-[#00bb03]"
                      }`}
                    />
                    <ErrorText msg={errors.title} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Description{reqStar}</label>
                    <textarea
                      value={description}
                      onChange={(e) => handleDescChange(e.target.value)}
                      placeholder="รายละเอียดแบนเนอร์"
                      rows={3}
                      className={`bg-[#f3f3f5] rounded px-4 py-2.5 font-['Prompt',sans-serif] text-[16px] outline-none border resize-y ${
                        errors.description ? "border-[#dc3f5a]" : "border-transparent focus:border-[#00bb03]"
                      }`}
                    />
                    <ErrorText msg={errors.description} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Background Image</label>
                    <input
                      ref={bgFileRef}
                      type="file"
                      accept=".jpg,.jpeg,image/jpeg"
                      className="hidden"
                      onChange={(e) => handleBgFile(e.target.files?.[0])}
                    />
                    <button
                      type="button"
                      onClick={() => bgFileRef.current?.click()}
                      className={`flex items-center justify-center gap-2 bg-[#f3f3f5] rounded px-4 py-6 border border-dashed hover:bg-gray-100 transition-colors ${
                        errors.bgImage ? "border-[#dc3f5a]" : "border-[#cbced4]"
                      }`}
                    >
                      <Upload size={20} className="text-[#6b7280]" />
                      <span className="font-['Prompt',sans-serif] text-[16px] text-[#6b7280]">
                        {bgImageName || "อัปโหลดรูปพื้นหลัง (.jpg / .jpeg, ไม่เกิน 20 MB)"}
                      </span>
                    </button>
                    {bgImageDataUrl && (
                      <div className="flex items-center gap-3 mt-2">
                        <img
                          src={bgImageDataUrl}
                          alt={bgImageName}
                          className="max-h-[120px] rounded border border-[#e0e0e0] object-contain"
                        />
                        <button
                          type="button"
                          onClick={clearBgImage}
                          className="font-['Prompt',sans-serif] text-[14px] text-[#dc3f5a] hover:underline"
                        >
                          ลบรูปพื้นหลัง
                        </button>
                      </div>
                    )}
                    <ErrorText msg={errors.bgImage} />
                    <span className="font-['Prompt',sans-serif] text-[12px] text-[#9ca3af]">
                      Optional — ข้อความจะแสดงทับบนรูปพื้นหลัง
                    </span>
                  </div>
                </>
              )}

              {contentType === "image" && (
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Image{reqStar}</label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".jpg,.jpeg,image/jpeg"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className={`flex items-center justify-center gap-2 bg-[#f3f3f5] rounded px-4 py-6 border border-dashed hover:bg-gray-100 transition-colors ${
                      errors.image ? "border-[#dc3f5a]" : "border-[#cbced4]"
                    }`}
                  >
                    <Upload size={20} className="text-[#6b7280]" />
                    <span className="font-['Prompt',sans-serif] text-[16px] text-[#6b7280]">
                      {imageName || "อัปโหลดรูปภาพ (.jpg / .jpeg, ไม่เกิน 20 MB)"}
                    </span>
                  </button>
                  {imageDataUrl && (
                    <img
                      src={imageDataUrl}
                      alt={imageName}
                      className="mt-2 max-h-[200px] rounded border border-[#e0e0e0] object-contain self-start"
                    />
                  )}
                  <ErrorText msg={errors.image} />
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="border-t border-[#e5e7eb] pt-6 flex items-center justify-end gap-3 flex-wrap">
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="min-w-[120px] px-6 py-2 rounded-[32px] font-['Prompt',sans-serif] text-[16px] text-black border border-[#e0e0e0] hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              className="min-w-[120px] px-6 py-2 rounded-[32px] font-['Prompt',sans-serif] text-[16px] text-black bg-[#f3f3f5] hover:bg-gray-200 transition-colors"
            >
              บันทึก
            </button>
            <button
              onClick={handlePublishClick}
              className="min-w-[120px] px-6 py-2 rounded-[32px] font-['Prompt',sans-serif] text-[16px] text-white bg-[#00bb03] hover:bg-green-600 transition-colors"
            >
              เผยแพร่
            </button>
          </div>
          </div>

          {/* RIGHT — live preview (sticky) */}
          <div className="w-[480px] shrink-0 sticky top-6 bg-white drop-shadow-[0px_2px_2px_rgba(0,0,0,0.25)] rounded flex flex-col gap-4 p-6">
            <div className="flex items-center gap-2">
              <Eye size={20} className="text-[#00bb03]" />
              <h3 className="font-['Prompt',sans-serif] text-[20px] font-semibold text-black">
                Live Preview
              </h3>
            </div>
            {template && contentType ? (
              <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded p-4 min-h-[140px] flex items-center justify-center">
                <BannerPreview
                  template={template}
                  contentType={contentType}
                  title={title}
                  description={description}
                  bgImageDataUrl={bgImageDataUrl}
                  imageDataUrl={imageDataUrl}
                  imageName={imageName}
                  maxWidth={432}
                />
              </div>
            ) : (
              <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded p-4 min-h-[220px] flex items-center justify-center">
                <p className="font-['Prompt',sans-serif] text-[14px] text-[#9ca3af] text-center">
                  เลือก Template เพื่อแสดงตัวอย่างแบนเนอร์
                </p>
              </div>
            )}
            {urlLink && isValidUrl(urlLink) && (
              <div className="flex flex-col gap-0.5">
                <span className="font-['Prompt',sans-serif] text-[12px] text-[#9ca3af]">URL Link</span>
                <a
                  href={urlLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-['Prompt',sans-serif] text-[14px] text-[#00bb03] underline break-all"
                >
                  {urlLink}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel confirmation */}
      <ConfirmDialog
        open={showCancelConfirm}
        title="ยกเลิกการแก้ไข?"
        message="ข้อมูลที่ยังไม่ได้บันทึกจะหายไป ต้องการกลับไปหน้า Marketing Tools หรือไม่"
        confirmLabel="ยืนยัน"
        cancelLabel="ยกเลิก"
        confirmVariant="danger"
        onConfirm={() => {
          setShowCancelConfirm(false);
          onCancel();
        }}
        onCancel={() => setShowCancelConfirm(false)}
      />

      {/* Publish confirmation */}
      <ConfirmDialog
        open={showPublishConfirm}
        title="ยืนยันการเผยแพร่?"
        message={
          wasPublished
            ? "การอัปเดตนี้จะแทนที่แบนเนอร์ที่กำลังแสดงอยู่บนหน้าเว็บทันที"
            : "แบนเนอร์จะแสดงบนหน้าเว็บทันทีหลังยืนยัน และเปลี่ยนสถานะเป็น Published"
        }
        confirmLabel="เผยแพร่"
        cancelLabel="ยกเลิก"
        confirmVariant="primary"
        onConfirm={() => {
          setShowPublishConfirm(false);
          onPublish(buildData());
        }}
        onCancel={() => setShowPublishConfirm(false)}
      />
    </div>
  );
}

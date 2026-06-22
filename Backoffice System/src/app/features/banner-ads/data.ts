// ─── Banner Ads — types, templates, sample data, and helpers ──────────────────

export type BannerStatus = "published" | "draft" | "unpublished";
export type ContentType = "text" | "image";

export interface BannerTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  size: string; // human readable, e.g. "2880 × 128 px"
  position: string;
  contentType: ContentType;
}

export interface Banner {
  id: string;
  name: string;
  templateId: string;
  status: BannerStatus;
  date: string; // DD-MM-YYYY — created/updated
  startDate: string; // YYYY-MM-DD (native input value)
  endDate: string; // YYYY-MM-DD
  urlLink: string;
  // text content
  title: string;
  description: string;
  bgImageName: string; // optional background image for text banners
  bgImageDataUrl: string;
  // image content
  imageName: string;
  imageDataUrl: string;
}

// ─── Templates (5 predefined) ─────────────────────────────────────────────────

export const TEMPLATES: BannerTemplate[] = [
  { id: "1", name: "Banner Ads 1", width: 2880, height: 128, size: "2880 × 128 px", position: "Top of Screen", contentType: "text" },
  { id: "2", name: "Banner Ads 2", width: 2440, height: 128, size: "2440 × 128 px", position: "Above Content Area", contentType: "text" },
  { id: "3", name: "Banner Ads 3", width: 440, height: 300, size: "440 × 300 px", position: "Below Side Menu", contentType: "image" },
  { id: "4", name: "Banner Ads 4", width: 440, height: 500, size: "440 × 500 px", position: "Beside Side Drawer", contentType: "image" },
  { id: "5", name: "Banner Ads 5", width: 2000, height: 128, size: "2000 × 128 px", position: "Bottom of Screen", contentType: "text" },
];

export function getTemplate(id: string): BannerTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

// ─── Sample banners (sorted most-recent → oldest when rendered) ───────────────

export const SAMPLE_BANNERS: Banner[] = [
  {
    id: "b1",
    name: "Mid-Year Sale 2026",
    templateId: "1",
    status: "published",
    date: "20-03-2026",
    startDate: "2026-03-20",
    endDate: "2026-07-31",
    urlLink: "https://line-diy.example.com/promo/mid-year",
    title: "Mid-Year Sale ลดสูงสุด 50%",
    description: "ช้อปสินค้าราคาพิเศษได้แล้ววันนี้ถึง 31 ก.ค.",
    bgImageName: "",
    bgImageDataUrl: "",
    imageName: "",
    imageDataUrl: "",
  },
  {
    id: "b2",
    name: "New Feature Announcement",
    templateId: "2",
    status: "draft",
    date: "12-03-2026",
    startDate: "2026-04-01",
    endDate: "2026-05-01",
    urlLink: "",
    title: "ฟีเจอร์ใหม่มาแล้ว!",
    description: "ลองใช้เครื่องมือจัดการแบนเนอร์ด้วยตัวคุณเอง",
    bgImageName: "",
    bgImageDataUrl: "",
    imageName: "",
    imageDataUrl: "",
  },
  {
    id: "b3",
    name: "Side Promo Banner",
    templateId: "3",
    status: "unpublished",
    date: "28-02-2026",
    startDate: "2026-02-01",
    endDate: "2026-02-28",
    urlLink: "https://line-diy.example.com/promo/side",
    title: "",
    description: "",
    bgImageName: "",
    bgImageDataUrl: "",
    imageName: "side-promo.jpg",
    imageDataUrl: "",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Format a Date as DD-MM-YYYY (the display format used across the backoffice).
export function formatDisplayDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

// Convert a native date-input value (YYYY-MM-DD) to display DD-MM-YYYY.
export function isoToDisplay(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
}

export const STATUS_LABEL: Record<BannerStatus, string> = {
  published: "Published",
  draft: "Draft",
  unpublished: "Unpublished",
};

export const STATUS_VARIANT: Record<BannerStatus, "approved" | "draft" | "unpublished"> = {
  published: "approved",
  draft: "draft",
  unpublished: "unpublished",
};

// V-01: detect emoji in a string (pictographic / symbol ranges).
const EMOJI_REGEX =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{200D}]/u;

export function hasEmoji(text: string): boolean {
  return EMOJI_REGEX.test(text);
}

// V-04: validate URL format (http/https).
export function isValidUrl(url: string): boolean {
  if (!url) return true; // optional field — empty is valid
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// V-02: image constraints.
export const MAX_IMAGE_BYTES = 20 * 1024 * 1024; // 20 MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg"]; // .jpg / .jpeg

export function isAllowedImage(file: File): boolean {
  const nameOk = /\.(jpg|jpeg)$/i.test(file.name);
  return nameOk && (ALLOWED_IMAGE_TYPES.includes(file.type) || file.type === "");
}

// V-03: count distinct templates already occupied by active (published/draft)
// banners whose display period overlaps the candidate's period. Used to enforce
// the "max 2 active templates in the same time period" rule.
export function activeTemplatesInPeriod(
  banners: Banner[],
  start: string,
  end: string,
  excludeBannerId?: string
): Set<string> {
  const occupied = new Set<string>();
  if (!start || !end) return occupied;
  for (const b of banners) {
    if (b.id === excludeBannerId) continue;
    if (b.status === "unpublished") continue;
    if (!b.startDate || !b.endDate) continue;
    // periods overlap when start <= b.end && b.start <= end
    if (start <= b.endDate && b.startDate <= end) {
      occupied.add(b.templateId);
    }
  }
  return occupied;
}

// Returns true if activating `templateId` for the given period would exceed the
// 2-template limit.
export function wouldExceedTemplateLimit(
  banners: Banner[],
  templateId: string,
  start: string,
  end: string,
  excludeBannerId?: string
): boolean {
  const occupied = activeTemplatesInPeriod(banners, start, end, excludeBannerId);
  if (occupied.has(templateId)) return false; // already counted
  return occupied.size >= 2;
}

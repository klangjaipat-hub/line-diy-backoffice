import { useState } from "react";
import {
  Search,
  ChevronLeft,
  Download,
  ChevronDown,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { StatusBadge } from "@/app/components/common";

// ─── Types ───────────────────────────────────────────────────────────────────

type View = "list" | "detail";
type TabType = "pending" | "approved" | "cancel";
type DocStatus = "pending" | "approved" | "rejecting" | "rejected";

interface Company {
  id: string;
  taxId: string;
  name: string;
  dateSubmitted: string;
  phone: string;
  email: string;
  address: string;
}

interface DocState {
  status: DocStatus;
  reason: string;
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const COMPANIES: Company[] = [
  {
    id: "1",
    taxId: "1234567890001",
    name: "Golden Trading Co., Ltd.",
    dateSubmitted: "20-01-2026",
    phone: "0987654321",
    email: "contact@goldentrading.co.th",
    address: "123 สุขุมวิท, คลองเตย, คลองเตย, กรุงเทพมหานคร, 10110",
  },
  {
    id: "2",
    taxId: "1234567890002",
    name: "Siam Electronics Ltd.",
    dateSubmitted: "20-01-2026",
    phone: "0812345678",
    email: "info@siamelectronics.co.th",
    address: "456 รัชดาภิเษก, ดินแดง, ดินแดง, กรุงเทพมหานคร, 10400",
  },
  {
    id: "3",
    taxId: "1234567890003",
    name: "Northern Logistics Group",
    dateSubmitted: "20-01-2026",
    phone: "0531234567",
    email: "ops@northernlogistics.co.th",
    address: "789 นิมมานเหมินทร์, สุเทพ, เมือง, เชียงใหม่, 50200",
  },
  {
    id: "4",
    taxId: "1234567890004",
    name: "Thai Import Export Co.",
    dateSubmitted: "20-01-2026",
    phone: "0234567890",
    email: "trade@thaiimportexport.co.th",
    address: "321 พระราม 3, บางคอแหลม, บางคอแหลม, กรุงเทพมหานคร, 10120",
  },
  {
    id: "5",
    taxId: "1234567890005",
    name: "Bangkok Wholesale Group",
    dateSubmitted: "20-01-2026",
    phone: "0298765432",
    email: "sales@bangkokwholesale.co.th",
    address: "654 ลาดพร้าว, จตุจักร, จตุจักร, กรุงเทพมหานคร, 10900",
  },
];

const DOCUMENTS = [
  "1. หนังสือรับรองบริษัท",
  "2. สำเนาบัตรประจำตัวประชาชนผู้มอบอำนาจ",
  "3. เอกสารการแต่งตั้ง บริษัท เซลสุกิ จำกัด",
  "4. เอกสารอื่น ๆ",
];

const REJECTION_REASONS = [
  "ขาดการลงนามผู้มีอำนาจและตราประทับ",
  "เอกสารหมดอายุ",
  "ข้อมูลไม่ครบถ้วน",
  "รูปภาพไม่ชัดเจน",
  "ที่อยู่ไม่ตรง",
];

// ─── Document Icon ────────────────────────────────────────────────────────────

function DocStatusIcon({ status }: { status: DocStatus }) {
  if (status === "approved") {
    return (
      <div className="size-5 flex items-center justify-center">
        <svg viewBox="0 0 20 20" fill="none" className="size-5">
          <circle cx="10" cy="10" r="9" stroke="#00BB03" strokeWidth="1.667" />
          <path d="M6 10.5l3 3 5-6" stroke="#00BB03" strokeWidth="1.667" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  if (status === "rejected" || status === "rejecting") {
    return (
      <div className="size-5 flex items-center justify-center">
        <svg viewBox="0 0 20 20" fill="none" className="size-5">
          <circle cx="10" cy="10" r="9" stroke="#DC3F5A" strokeWidth="1.667" />
          <path d="M12.5 7.5L7.5 12.5M7.5 7.5L12.5 12.5" stroke="#DC3F5A" strokeWidth="1.667" strokeLinecap="round" />
        </svg>
      </div>
    );
  }
  return (
    <div className="size-5 flex items-center justify-center">
      <svg viewBox="0 0 20 20" fill="none" className="size-5">
        <circle cx="10" cy="10" r="9" stroke="#D97706" strokeWidth="1.667" />
        <path d="M10 5V10L13.333 11.667" stroke="#D97706" strokeWidth="1.667" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ─── Pending Approval List Page ───────────────────────────────────────────────

function PendingApprovalPage({
  activeTab,
  onTabChange,
  onDetailClick,
}: {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onDetailClick: (company: Company) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCompanies = COMPANIES.filter(
    (c) =>
      c.taxId.includes(searchQuery) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabData: { key: TabType; label: string }[] = [
    { key: "pending", label: "Pending Approval" },
    { key: "approved", label: "Approved" },
    { key: "cancel", label: "Cancel Agent" },
  ];

  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <div className="px-12 py-6 flex flex-col gap-4">
        {/* Content card */}
        <div className="bg-white drop-shadow-[0px_2px_2px_rgba(0,0,0,0.25)] rounded flex flex-col gap-4 p-6">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <h1 className="font-['Prompt',sans-serif] text-[36px] text-black leading-normal w-[500px]">
              Tax Agent
            </h1>
            <div className="bg-[#f4f4f4] flex items-center px-6 py-2 rounded-[32px] w-[442px]">
              <Search size={18} className="text-[#757575] mr-2 shrink-0" />
              <input
                type="text"
                placeholder="ค้นหาเลขประจำตัวผู้เสียภาษี, ชื่อบริษัท"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent font-['Prompt',sans-serif] text-[16px] text-[#757575] outline-none w-full placeholder:text-[#757575]"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-start border-b border-[#e5e7eb]">
            {tabData.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
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

          {/* Table */}
          <div className="bg-white drop-shadow-[0px_0px_2px_rgba(0,0,0,0.25)] w-full overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                  <th className="text-left px-6 py-3 font-['Prompt',sans-serif] font-semibold text-[12px] text-[#6b7280] leading-[22px] whitespace-nowrap w-[194px] text-center">
                    Actions
                  </th>
                  <th className="text-left px-6 py-3 font-['Prompt',sans-serif] font-semibold text-[12px] text-[#6b7280] leading-[22px] whitespace-nowrap w-[200px]">
                    Tax ID
                  </th>
                  <th className="text-left px-6 py-3 font-['Prompt',sans-serif] font-semibold text-[12px] text-[#6b7280] leading-[22px] whitespace-nowrap">
                    Company Name
                  </th>
                  <th className="text-center px-4 py-3 font-['Prompt',sans-serif] font-semibold text-[12px] text-[#6b7280] leading-[22px] whitespace-nowrap w-[200px]">
                    Status
                  </th>
                  <th className="text-center px-4 py-3 font-['Prompt',sans-serif] font-semibold text-[12px] text-[#6b7280] leading-[22px] whitespace-nowrap w-[200px]">
                    Date Submitted
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="border-b border-[#e5e7eb] hover:bg-gray-50 transition-colors">
                    <td className="h-[52px] px-6 py-3">
                      <div className="flex items-center justify-center gap-6">
                        <button
                          onClick={() => onDetailClick(company)}
                          className="border border-[#00bb03] text-[#00bb03] font-['Prompt',sans-serif] text-[16px] px-8 py-1 rounded-[32px] whitespace-nowrap hover:bg-green-50 transition-colors"
                        >
                          Detail
                        </button>
                        <button className="text-[#DC3F5A] hover:text-red-700 transition-colors" aria-label="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                    <td className="h-[52px] px-6 py-3">
                      <span className="font-['Prompt',sans-serif] text-[14px] text-black leading-[22px]">
                        {company.taxId}
                      </span>
                    </td>
                    <td className="h-[52px] px-6 py-3">
                      <span className="font-['Prompt',sans-serif] text-[14px] text-black leading-[22px]">
                        {company.name}
                      </span>
                    </td>
                    <td className="h-[52px] px-4 py-3 text-center">
                      <StatusBadge label="รออนุมัติ" variant="pending" />
                    </td>
                    <td className="h-[52px] px-4 py-3 text-center">
                      <span className="font-['Prompt',sans-serif] text-[14px] text-black leading-[22px]">
                        {company.dateSubmitted}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2">
            <button className="bg-white drop-shadow-[0px_0px_2px_rgba(17,24,39,0.08)] flex items-center p-1.5 rounded">
              <ChevronLeft size={24} className="text-[#9CA3AF]" />
            </button>
            <button className="bg-[#00bb03] drop-shadow-[0px_0px_2px_rgba(17,24,39,0.08)] flex items-center justify-center h-[34px] w-[34px] rounded text-white font-['Prompt',sans-serif] text-[16px]">
              1
            </button>
            <button className="bg-white drop-shadow-[0px_0px_2px_rgba(17,24,39,0.08)] flex items-center p-1.5 rounded">
              <ChevronRight size={24} className="text-[#6B7280]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Review Document Page ─────────────────────────────────────────────────────

function ReviewDocumentPage({
  company,
  onBack,
}: {
  company: Company;
  onBack: () => void;
}) {
  const [infoStatus, setInfoStatus] = useState<DocStatus>("pending");
  const [infoReason, setInfoReason] = useState("");
  const [infoReasonOpen, setInfoReasonOpen] = useState(false);

  const [docStates, setDocStates] = useState<DocState[]>(
    DOCUMENTS.map(() => ({ status: "pending" as DocStatus, reason: "" }))
  );
  const [activeDoc, setActiveDoc] = useState(0);
  const [docPage, setDocPage] = useState(1);

  // dropdown open state per document
  const [dropdownOpen, setDropdownOpen] = useState<boolean[]>(DOCUMENTS.map(() => false));

  const allApproved =
    infoStatus === "approved" && docStates.every((d) => d.status === "approved");
  const anyRejected =
    infoStatus === "rejected" || docStates.some((d) => d.status === "rejected");

  function updateDocStatus(idx: number, status: DocStatus) {
    setDocStates((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, status } : d))
    );
  }

  function updateDocReason(idx: number, reason: string) {
    setDocStates((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, reason } : d))
    );
  }

  function toggleDocDropdown(idx: number) {
    setDropdownOpen((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  }

  function confirmDocReject(idx: number) {
    if (docStates[idx].reason) {
      updateDocStatus(idx, "rejected");
      setDropdownOpen((prev) => prev.map((v, i) => (i === idx ? false : v)));
    }
  }

  function cancelDocReject(idx: number) {
    updateDocStatus(idx, "pending");
    updateDocReason(idx, "");
    setDropdownOpen((prev) => prev.map((v, i) => (i === idx ? false : v)));
  }

  const docBorderColor = (status: DocStatus, isActive: boolean) => {
    if (status === "rejecting") return "border-[#dc3f5a]";
    if (isActive) return "border-[#00bb03]";
    return "border-[#e0e0e0]";
  };

  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <div className="px-12 py-6 flex flex-col gap-3 min-w-max">
        {/* Back + Action row */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-4 hover:opacity-70 transition-opacity"
          >
            <div className="rotate-[-90deg]">
              <svg viewBox="0 0 20 20" fill="none" className="size-5">
                <path d="M10 3l-7 7h14l-7-7z" fill="black" />
              </svg>
            </div>
            <span className="font-['Prompt',sans-serif] text-[16px] text-black">กลับ</span>
          </button>

          <div className="flex items-center gap-4">
            <button
              disabled={!allApproved}
              className={`min-w-[150px] px-6 py-2 rounded-[32px] font-['Prompt',sans-serif] text-[16px] text-center transition-colors ${
                allApproved
                  ? "bg-[#00bb03] text-white hover:bg-green-600"
                  : "bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed"
              }`}
            >
              อนุมัติ
            </button>
            <button
              disabled={!anyRejected}
              className={`min-w-[150px] px-6 py-2 rounded-[32px] font-['Prompt',sans-serif] text-[16px] text-center transition-colors ${
                anyRejected
                  ? "bg-amber-100 text-amber-700 border border-amber-400 hover:bg-amber-200"
                  : "bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed"
              }`}
            >
              แจ้งแก้ไข
            </button>
            <button
              onClick={onBack}
              className="relative min-w-[150px] px-6 py-2 rounded-[32px] font-['Prompt',sans-serif] text-[16px] text-[#dc3f5a] text-center border border-[#dc3f5a] hover:bg-red-50 transition-colors"
            >
              ยกเลิกการแต่งตั้ง
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="flex items-center gap-4">
          <p className="font-['Prompt',sans-serif] text-[32px] text-black leading-normal">
            ข้อมูลคำขอแต่งตั้งตัว Sellsuki เป็นตัวแทนหักและนำส่งภาษี ณ ที่จ่าย:{" "}
            <strong>{company.taxId}</strong>
          </p>
          <StatusBadge label="รออนุมัติ" variant="pending" />
        </div>

        {/* Main content split */}
        <div className="bg-white drop-shadow-[0px_1px_1px_rgba(17,24,39,0.07)] flex items-start rounded border border-[#e0e0e0]">
          {/* LEFT PANEL */}
          <div className="w-[414px] shrink-0 border-r border-[#e0e0e0] overflow-y-auto">
            <div className="flex flex-col gap-8 px-6 py-6">
              {/* Company Info Section */}
              <div className="flex flex-col gap-4">
                <h3 className="font-['Prompt',sans-serif] text-[20px] text-black leading-[28px] tracking-[-0.44px]">
                  ข้อมูลสำหรับออกใบกำกับภาษี
                </h3>
                <div className="relative bg-white border border-[#e0e0e0] rounded p-4 flex flex-col gap-4">
                  {/* Status icon top-right */}
                  <div className="absolute right-4 top-4">
                    <DocStatusIcon status={infoStatus} />
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <p className="font-['Prompt',sans-serif] text-[16px] text-black">เลขประจำตัวผู้เสียภาษี</p>
                    <p className="font-['Prompt',sans-serif] font-semibold text-[16px] text-black">{company.taxId}</p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="font-['Prompt',sans-serif] text-[16px] text-black">ชื่อร้านค้า หรือบริษัท</p>
                    <p className="font-['Prompt',sans-serif] font-semibold text-[16px] text-black">{company.name}</p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="font-['Prompt',sans-serif] text-[16px] text-black">โทรศัพท์</p>
                    <p className="font-['Prompt',sans-serif] font-semibold text-[16px] text-black">{company.phone}</p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="font-['Prompt',sans-serif] text-[16px] text-black">Email</p>
                    <p className="font-['Prompt',sans-serif] font-semibold text-[16px] text-black">{company.email}</p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="font-['Prompt',sans-serif] text-[16px] text-black">ที่อยู่ (ที่จดทะเบียนบริษัท)</p>
                    <p className="font-['Prompt',sans-serif] font-semibold text-[16px] text-black">{company.address}</p>
                  </div>

                  {/* Rejection reason banner for info card */}
                  {infoStatus === "rejected" && infoReason && (
                    <div className="bg-[#fdf2f8] border border-[#fccee8] rounded px-4 py-2 flex gap-1">
                      <span className="font-['Prompt',sans-serif] font-semibold text-[14px] text-[#c6005c] leading-[16px]">เหตุผล:</span>
                      <span className="font-['Prompt',sans-serif] text-[14px] text-[#c6005c] leading-[16px]">{infoReason}</span>
                    </div>
                  )}

                  {/* Info card action buttons */}
                  {infoStatus === "pending" && (
                    <div className="flex gap-2 h-7">
                      <button
                        onClick={() => setInfoStatus("approved")}
                        className="bg-[#00bb03] text-white font-['Prompt',sans-serif] text-[16px] min-w-[100px] px-4 py-1 rounded-[32px] hover:bg-green-600 transition-colors"
                      >
                        อนุมัติ
                      </button>
                      <button
                        onClick={() => setInfoStatus("rejecting")}
                        className="bg-white text-[#dc3f5a] font-['Prompt',sans-serif] text-[16px] min-w-[100px] px-4 py-1 rounded-[32px] border border-[#dc3f5a] hover:bg-red-50 transition-colors"
                      >
                        ไม่อนุมัติ
                      </button>
                    </div>
                  )}

                  {infoStatus === "rejecting" && (
                    <>
                      {/* Reason dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setInfoReasonOpen(!infoReasonOpen)}
                          className="w-full bg-white border border-[#e0e0e0] rounded px-4 py-2 flex items-center justify-between text-left"
                        >
                          <span className="font-['Prompt',sans-serif] text-[14px] text-black flex-1">
                            {infoReason || "เลือกเหตุผล"}
                          </span>
                          <ChevronDown size={16} className="text-[#6B7280] shrink-0" />
                        </button>
                        {infoReasonOpen && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-[#e0e0e0] rounded shadow-md z-20">
                            {REJECTION_REASONS.map((reason) => (
                              <button
                                key={reason}
                                onClick={() => {
                                  setInfoReason(reason);
                                  setInfoReasonOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 font-['Prompt',sans-serif] text-[14px] text-black hover:bg-gray-50 transition-colors"
                              >
                                {reason}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 h-7">
                        <button
                          onClick={() => {
                            if (infoReason) {
                              setInfoStatus("rejected");
                              setInfoReasonOpen(false);
                            }
                          }}
                          className="bg-[#dc3f5a] text-white font-['Prompt',sans-serif] text-[16px] min-w-[100px] px-4 py-1 rounded-[32px] hover:bg-red-600 transition-colors"
                        >
                          ยืนยัน
                        </button>
                        <button
                          onClick={() => {
                            setInfoStatus("pending");
                            setInfoReason("");
                            setInfoReasonOpen(false);
                          }}
                          className="bg-white text-black font-['Prompt',sans-serif] text-[16px] min-w-[100px] px-4 py-1 rounded-[32px] border border-[#e0e0e0] hover:bg-gray-50 transition-colors"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Documents Section */}
              <div className="flex flex-col gap-4">
                <h3 className="font-['Prompt',sans-serif] text-[20px] text-black leading-[28px] tracking-[-0.44px]">
                  เอกสารที่เกี่ยวข้อง
                </h3>
                <div className="flex flex-col gap-4">
                  {DOCUMENTS.map((doc, idx) => {
                    const state = docStates[idx];
                    const isActive = activeDoc === idx;
                    const borderClass = docBorderColor(state.status, isActive);
                    return (
                      <div
                        key={idx}
                        className={`relative bg-white border rounded p-4 flex flex-col gap-4 cursor-pointer ${borderClass}`}
                        onClick={() => setActiveDoc(idx)}
                      >
                        {/* Doc header */}
                        <div className="flex items-start justify-between">
                          <p className="font-['Prompt',sans-serif] text-[16px] text-black leading-[20px] flex-1 pr-2 tracking-[-0.15px]">
                            {doc}
                          </p>
                          <DocStatusIcon status={state.status} />
                        </div>

                        {/* Rejection reason banner */}
                        {state.status === "rejected" && state.reason && (
                          <div className="bg-[#fdf2f8] border border-[#fccee8] rounded px-4 py-2 flex gap-1">
                            <span className="font-['Prompt',sans-serif] font-semibold text-[14px] text-[#c6005c] leading-[16px]">เหตุผล:</span>
                            <span className="font-['Prompt',sans-serif] text-[14px] text-[#c6005c] leading-[16px]">{state.reason}</span>
                          </div>
                        )}

                        {/* Action buttons for pending */}
                        {state.status === "pending" && (
                          <div className="flex gap-2 h-7">
                            <button
                              onClick={(e) => { e.stopPropagation(); updateDocStatus(idx, "approved"); }}
                              className="bg-[#00bb03] text-white font-['Prompt',sans-serif] text-[16px] min-w-[100px] px-4 py-1 rounded-[32px] hover:bg-green-600 transition-colors"
                            >
                              อนุมัติ
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); updateDocStatus(idx, "rejecting"); }}
                              className="bg-white text-[#dc3f5a] font-['Prompt',sans-serif] text-[16px] min-w-[100px] px-4 py-1 rounded-[32px] border border-[#dc3f5a] hover:bg-red-50 transition-colors"
                            >
                              ไม่อนุมัติ
                            </button>
                          </div>
                        )}

                        {/* Rejecting state: dropdown + confirm/cancel */}
                        {state.status === "rejecting" && (
                          <>
                            <div className="relative">
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleDocDropdown(idx); }}
                                className="w-full bg-white border border-[#e0e0e0] rounded px-4 py-2 flex items-center justify-between text-left"
                              >
                                <span className="font-['Prompt',sans-serif] text-[14px] text-black flex-1">
                                  {state.reason || "ขาดการลงนามผู้มีอำนาจและตราประทับ"}
                                </span>
                                <ChevronDown size={16} className="text-[#6B7280] shrink-0" />
                              </button>
                              {dropdownOpen[idx] && (
                                <div className="absolute top-full left-0 right-0 bg-white border border-[#e0e0e0] rounded shadow-md z-20">
                                  {REJECTION_REASONS.map((reason) => (
                                    <button
                                      key={reason}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateDocReason(idx, reason);
                                        toggleDocDropdown(idx);
                                      }}
                                      className="w-full text-left px-4 py-2 font-['Prompt',sans-serif] text-[14px] text-black hover:bg-gray-50 transition-colors"
                                    >
                                      {reason}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 h-7">
                              <button
                                onClick={(e) => { e.stopPropagation(); confirmDocReject(idx); }}
                                className="bg-[#dc3f5a] text-white font-['Prompt',sans-serif] text-[16px] min-w-[100px] px-4 py-1 rounded-[32px] hover:bg-red-600 transition-colors"
                              >
                                ยืนยัน
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); cancelDocReject(idx); }}
                                className="bg-white text-black font-['Prompt',sans-serif] text-[16px] min-w-[100px] px-4 py-1 rounded-[32px] border border-[#e0e0e0] hover:bg-gray-50 transition-colors"
                              >
                                ยกเลิก
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL – Document Preview */}
          <div className="flex-1 min-w-0 bg-[#f4f4f4] self-stretch flex flex-col">
            {/* Preview header */}
            <div className="bg-white border-b border-[#e0e0e0] flex items-center justify-between px-6 py-4">
              <p className="font-['Prompt',sans-serif] text-[20px] text-black leading-[20px] tracking-[-0.15px]">
                Document Preview
              </p>
              <button className="text-[#00BB03] hover:text-green-600 transition-colors">
                <Download size={24} />
              </button>
            </div>

            {/* Preview area */}
            <div className="flex-1 flex items-start justify-center p-6 relative overflow-hidden" style={{ minHeight: 500 }}>
              <div className="bg-white border border-[#e0e0e0] w-full h-full flex flex-col items-center justify-end pb-16 drop-shadow-[0px_4px_2px_rgba(17,24,39,0.08)]" style={{ minHeight: 400 }}>
                <div className="flex flex-col items-center gap-2">
                  <p className="font-['Inter',sans-serif] text-[14px] text-[#9ca3af] leading-[20px] tracking-[-0.15px]">
                    Document Preview
                  </p>
                  <p className="font-['Inter',sans-serif] text-[12px] text-[#9ca3af] leading-[16px]">
                    PDF/Image {docPage} of 3
                  </p>
                </div>
              </div>

              {/* Scrollbar decoration */}
              <div className="absolute right-5 top-6 bottom-16 w-[6px]">
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-[#9ca3af] rounded-[8px]" />
              </div>
            </div>

            {/* Pagination */}
            <div className="bg-white border-t border-[#e0e0e0] flex items-center justify-center gap-2 px-6 py-4">
              <button
                onClick={() => setDocPage((p) => Math.max(1, p - 1))}
                className="bg-white drop-shadow-[0px_0px_2px_rgba(17,24,39,0.08)] flex items-center p-1.5 rounded"
              >
                <ChevronLeft size={24} className="text-[#9CA3AF]" />
              </button>
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  onClick={() => setDocPage(page)}
                  className={`drop-shadow-[0px_0px_2px_rgba(17,24,39,0.08)] flex items-center justify-center h-[34px] w-[34px] rounded font-['Prompt',sans-serif] text-[16px] transition-colors ${
                    docPage === page
                      ? "bg-[#00bb03] text-white"
                      : "bg-white text-black hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setDocPage((p) => Math.min(3, p + 1))}
                className="bg-white drop-shadow-[0px_0px_2px_rgba(17,24,39,0.08)] flex items-center p-1.5 rounded"
              >
                <ChevronRight size={24} className="text-[#6B7280]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tax Agent Feature (internal routing) ─────────────────────────────────────

export function TaxAgentFeature() {
  const [view, setView] = useState<View>("list");
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  function handleDetailClick(company: Company) {
    setSelectedCompany(company);
    setView("detail");
  }

  function handleBack() {
    setView("list");
    setSelectedCompany(null);
  }

  if (view === "detail" && selectedCompany) {
    return <ReviewDocumentPage company={selectedCompany} onBack={handleBack} />;
  }

  return (
    <PendingApprovalPage
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onDetailClick={handleDetailClick}
    />
  );
}

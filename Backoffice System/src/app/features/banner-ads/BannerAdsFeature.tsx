import { useState } from "react";
import { BannerListPage } from "./BannerListPage";
import { BannerFormPage } from "./BannerFormPage";
import { BannerDetailPage } from "./BannerDetailPage";
import { Banner, BannerStatus, SAMPLE_BANNERS, formatDisplayDate } from "./data";

type BannerView = "list" | "create" | "edit" | "detail";

let idCounter = 100;
function nextId() {
  idCounter += 1;
  return `b${idCounter}`;
}

export function BannerAdsFeature() {
  const [banners, setBanners] = useState<Banner[]>(SAMPLE_BANNERS);
  const [view, setView] = useState<BannerView>("list");
  const [selected, setSelected] = useState<Banner | null>(null);

  const today = () => formatDisplayDate(new Date());

  function goList() {
    setView("list");
    setSelected(null);
  }

  // Save (Draft) or Publish — create or update depending on `selected`.
  function commit(
    data: Omit<Banner, "id" | "status" | "date">,
    status: BannerStatus
  ) {
    if (selected && view === "edit") {
      setBanners((prev) =>
        prev.map((b) =>
          b.id === selected.id ? { ...b, ...data, status, date: today() } : b
        )
      );
    } else {
      const created: Banner = { ...data, id: nextId(), status, date: today() };
      setBanners((prev) => [created, ...prev]);
    }
    goList();
  }

  function handleUnpublish(banner: Banner) {
    setBanners((prev) =>
      prev.map((b) =>
        b.id === banner.id ? { ...b, status: "unpublished", date: today() } : b
      )
    );
    goList();
  }

  // Publish a Draft / Unpublished banner directly from its detail page.
  function handlePublish(banner: Banner) {
    setBanners((prev) =>
      prev.map((b) =>
        b.id === banner.id ? { ...b, status: "published", date: today() } : b
      )
    );
    goList();
  }

  if (view === "create" || view === "edit") {
    return (
      <BannerFormPage
        existing={view === "edit" ? selected ?? undefined : undefined}
        banners={banners}
        onSaveDraft={(data) => commit(data, "draft")}
        onPublish={(data) => commit(data, "published")}
        onCancel={goList}
      />
    );
  }

  if (view === "detail" && selected) {
    return (
      <BannerDetailPage
        banner={selected}
        onBack={goList}
        onEdit={(banner) => {
          setSelected(banner);
          setView("edit");
        }}
        onUnpublish={handleUnpublish}
        onPublish={handlePublish}
      />
    );
  }

  return (
    <BannerListPage
      banners={banners}
      onCreate={() => {
        setSelected(null);
        setView("create");
      }}
      onEdit={(banner) => {
        setSelected(banner);
        setView("edit");
      }}
      onRowClick={(banner) => {
        setSelected(banner);
        setView("detail");
      }}
    />
  );
}

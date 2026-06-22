import { useState } from "react";
import { Header } from "./components/Header";
import { Sidebar, FeatureKey } from "./components/Sidebar";
import { TaxAgentFeature } from "./features/tax-agent/TaxAgentFeature";
import { BannerAdsFeature } from "./features/banner-ads/BannerAdsFeature";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [feature, setFeature] = useState<FeatureKey>("banner-ads");

  return (
    <div className="bg-white flex flex-col items-stretch size-full font-['Prompt',sans-serif]">
      <Header onMenuClick={() => setSidebarOpen(true)} />

      <Sidebar
        open={sidebarOpen}
        active={feature}
        onSelect={setFeature}
        onClose={() => setSidebarOpen(false)}
      />

      {feature === "tax-agent" ? <TaxAgentFeature /> : <BannerAdsFeature />}
    </div>
  );
}

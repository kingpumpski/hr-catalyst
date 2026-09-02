import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings2, RotateCcw } from "lucide-react";
import { CV_FORMAT_PROFILES, type CvMarket } from "@/data/cvFormatProfiles";
import { DEFAULT_DOCUMENT_SETTINGS, loadDocumentSettings, saveDocumentSettings, type DocumentSettings } from "@/lib/documentSettings";

type DocumentSettingsPanelProps = { onChange?: (settings: DocumentSettings) => void };

const toggleItems = [
  { key: "showContactDetails", label: "Show contact details" },
  { key: "showLocation", label: "Show location" },
  { key: "showAvailability", label: "Show availability" },
  { key: "showReferences", label: "Show references" },
  { key: "includeLinkedIn", label: "Include LinkedIn" },
  { key: "includeWhatsApp", label: "Include WhatsApp" },
  { key: "resumeMode", label: "Prefer resume-style layout" },
] as const;

const DocumentSettingsPanel = ({ onChange }: DocumentSettingsPanelProps) => {
  const [settings, setSettings] = useState<DocumentSettings>(() => loadDocumentSettings());

  const persist = (next: DocumentSettings) => {
    setSettings(next);
    saveDocumentSettings(next);
    onChange?.(next);
  };

  const updateSetting = (key: keyof DocumentSettings, value: boolean | string) => {
    persist({ ...settings, [key]: value } as DocumentSettings);
  };

  const resetSettings = () => persist(DEFAULT_DOCUMENT_SETTINGS);
  const market = CV_FORMAT_PROFILES[settings.targetMarket];
  const photoBlocked = market.photoPolicy === "never";
  const photoRequired = market.photoPolicy === "required";

  return (
    <Card className="border-border/80 p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-foreground"><Settings2 className="h-5 w-5" /><h3 className="text-lg font-semibold">Document settings</h3></div>
          <p className="mt-1 text-sm text-muted-foreground">Control document content, target market, paper size and optional photograph policy.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={resetSettings}><RotateCcw className="mr-2 h-4 w-4" />Reset</Button>
      </div>

      <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <label className="block text-sm font-semibold text-foreground" htmlFor="target-market">Target application market</label>
        <select id="target-market" value={settings.targetMarket} onChange={(e) => persist({ ...settings, targetMarket: e.target.value as CvMarket, includePhoto: false })} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground">
          {Object.values(CV_FORMAT_PROFILES).map((profile) => <option key={profile.market} value={profile.market}>{profile.label} — {profile.documentLabel} — {profile.paperSize}</option>)}
        </select>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">{market.notes} Photo policy: {market.photoPolicy}. The target market is an application destination, not nationality.</p>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="rounded-lg border border-border p-3 text-sm font-medium text-foreground" htmlFor="photo-url">Professional photo URL (optional)
          <input id="photo-url" type="url" value={settings.photoUrl} onChange={(e) => updateSetting("photoUrl", e.target.value)} placeholder="https://…" className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-normal" />
        </label>
        <div className="rounded-lg border border-border p-3">
          <div className="flex items-center justify-between gap-3"><span className="text-sm font-medium text-foreground">Include professional photo</span><Switch checked={settings.includePhoto && !photoBlocked} disabled={photoBlocked || photoRequired} onCheckedChange={(value) => updateSetting("includePhoto", value)} /></div>
          <p className="mt-2 text-xs text-muted-foreground">{photoBlocked ? "This market does not support photos in the ATS profile." : photoRequired ? "This market supports a photo-required format; a dedicated Japan Rirekisho renderer will be added separately." : "Photos remain opt-in. They are never inserted automatically."}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {toggleItems.map((item) => (
          <label key={item.key} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
            <span className="text-sm text-foreground">{item.label}</span>
            <Switch checked={settings[item.key as keyof DocumentSettings] as boolean} onCheckedChange={(value) => updateSetting(item.key as keyof DocumentSettings, value)} />
          </label>
        ))}
      </div>
    </Card>
  );
};

export default DocumentSettingsPanel;

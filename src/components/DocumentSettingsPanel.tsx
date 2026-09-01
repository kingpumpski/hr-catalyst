import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings2, RotateCcw } from "lucide-react";
import {
  DEFAULT_DOCUMENT_SETTINGS,
  loadDocumentSettings,
  saveDocumentSettings,
  type DocumentSettings,
} from "@/lib/documentSettings";

type DocumentSettingsPanelProps = {
  onChange?: (settings: DocumentSettings) => void;
};

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

  useEffect(() => {
    onChange?.(settings);
  }, [onChange, settings]);

  const updateSetting = (key: keyof DocumentSettings, value: boolean) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveDocumentSettings(next);
    onChange?.(next);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_DOCUMENT_SETTINGS);
    saveDocumentSettings(DEFAULT_DOCUMENT_SETTINGS);
    onChange?.(DEFAULT_DOCUMENT_SETTINGS);
  };

  return (
    <Card className="p-6 shadow-soft border-border/80">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-foreground">
            <Settings2 className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Document settings</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Control what appears in the public profile and the downloadable CV/resume output.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={resetSettings}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {toggleItems.map((item) => (
          <label key={item.key} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
            <span className="text-sm text-foreground">{item.label}</span>
            <Switch
              checked={settings[item.key as keyof DocumentSettings] as boolean}
              onCheckedChange={(value) => updateSetting(item.key as keyof DocumentSettings, value)}
            />
          </label>
        ))}
      </div>
    </Card>
  );
};

export default DocumentSettingsPanel;

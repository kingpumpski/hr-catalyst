import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RotateCcw, Share2 } from "lucide-react";
import { DEFAULT_SOCIAL_SETTINGS, loadSocialSettings, saveSocialSettings, type ConfiguredSocialLink } from "@/lib/socialSettings";

const SocialProfileSettings = () => {
  const [links, setLinks] = useState<ConfiguredSocialLink[]>(() => loadSocialSettings());

  const persist = (next: ConfiguredSocialLink[]) => {
    setLinks(next);
    saveSocialSettings(next);
  };

  const update = (label: string, patch: Partial<ConfiguredSocialLink>) => {
    persist(links.map((link) => link.label === label ? { ...link, ...patch } : link));
  };

  return (
    <Card className="border-border/80 p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div><div className="flex items-center gap-2"><Share2 className="h-5 w-5" /><h3 className="text-lg font-semibold">Professional social profiles</h3></div><p className="mt-1 text-sm text-muted-foreground">Manage which confirmed professional profiles appear on the public career site.</p></div>
        <Button variant="ghost" size="sm" onClick={() => persist(DEFAULT_SOCIAL_SETTINGS)}><RotateCcw className="mr-2 h-4 w-4" />Reset</Button>
      </div>
      <div className="mt-6 space-y-3">
        {links.map((link) => (
          <div key={link.label} className="rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold text-foreground">{link.label}</p><p className="text-xs text-muted-foreground">Only enable an account after confirming the URL.</p></div><Switch checked={link.enabled && Boolean(link.url)} disabled={!link.url} onCheckedChange={(enabled) => update(link.label, { enabled })} /></div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="text-sm font-medium text-foreground">Handle<input value={link.handle ?? ""} onChange={(e) => update(link.label, { handle: e.target.value })} className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-normal" /></label>
              <label className="text-sm font-medium text-foreground">Profile URL<input type="url" value={link.url} onChange={(e) => update(link.label, { url: e.target.value, enabled: Boolean(e.target.value.trim()) })} className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-normal" placeholder="https://…" /></label>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default SocialProfileSettings;

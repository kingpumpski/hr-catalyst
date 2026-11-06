import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CvEditorData } from "@/lib/cvEditor";
import { Plus, Trash2 } from "lucide-react";

type Props = { value: CvEditorData; onChange: (value: CvEditorData) => void };

const CvEditorPanel = ({ value, onChange }: Props) => {
  const [active, setActive] = useState("profile");
  const update = (patch: Partial<CvEditorData>) => onChange({ ...value, ...patch });
  const updateProfile = (field: keyof CvEditorData["profile"], next: string) =>
    update({ profile: { ...value.profile, [field]: next } });
  const tabs = [
    ["profile", "Profile"], ["summary", "Summary"], ["skills", "Skills"],
    ["experience", "Experience"], ["education", "Education"],
    ["highlights", "Highlights"], ["additional", "Additional"],
  ];

  return (
    <section className="mb-8 rounded-xl border border-border bg-card p-4 shadow-soft" aria-label="CV editor">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-lg font-semibold">Edit your CV</h2><p className="text-sm text-muted-foreground">Changes update the document preview and save in this browser for this career track.</p></div>
        <span className="text-xs text-muted-foreground">Autosave enabled</span>
      </div>
      <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="CV sections">
        {tabs.map(([id, label]) => <Button key={id} size="sm" variant={active === id ? "default" : "outline"} role="tab" aria-selected={active === id} onClick={() => setActive(id)}>{label}</Button>)}
      </div>

      {active === "profile" && <div className="grid gap-3 sm:grid-cols-2">
        {([["name","Full name"],["email","Email"],["phone","Phone"],["address","Location / address"],["linkedin","LinkedIn URL"]] as const).map(([field,label]) =>
          <label key={field} className="text-sm font-medium">{label}<Input className="mt-1" value={value.profile[field]} onChange={(e) => updateProfile(field,e.target.value)} /></label>)}
      </div>}
      {active === "summary" && <label className="block text-sm font-medium">Professional summary<Textarea className="mt-1" rows={7} value={value.summary} onChange={(e) => update({summary:e.target.value})} /></label>}
      {active === "skills" && <label className="block text-sm font-medium">Skills <span className="font-normal text-muted-foreground">(one per line)</span><Textarea className="mt-1" rows={12} value={value.skills.join("\n")} onChange={(e) => update({skills:e.target.value.split("\n").map(x=>x.trim()).filter(Boolean)})} /></label>}
      {active === "highlights" && <label className="block text-sm font-medium">Selected achievements <span className="font-normal text-muted-foreground">(one per line)</span><Textarea className="mt-1" rows={10} value={value.highlights.join("\n")} onChange={(e) => update({highlights:e.target.value.split("\n").map(x=>x.trim()).filter(Boolean)})} /></label>}
      {active === "experience" && <div className="space-y-4">
        {value.experience.map((item,index) => <div key={item.id} className="rounded-lg border border-border p-3">
          <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold">Position {index+1}</h3><Button size="sm" variant="ghost" aria-label={`Remove position ${index+1}`} onClick={()=>update({experience:value.experience.filter(x=>x.id!==item.id)})}><Trash2 className="h-4 w-4" /></Button></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {(["company","title","location","period"] as const).map(field=><label key={field} className="text-sm font-medium capitalize">{field}<Input className="mt-1" value={item[field]} onChange={e=>update({experience:value.experience.map(x=>x.id===item.id?{...x,[field]:e.target.value}:x)})}/></label>)}
          </div>
          <label className="mt-3 block text-sm font-medium">Responsibilities and achievements <span className="font-normal text-muted-foreground">(one per line)</span><Textarea className="mt-1" rows={5} value={item.contributions.join("\n")} onChange={e=>update({experience:value.experience.map(x=>x.id===item.id?{...x,contributions:e.target.value.split("\n").map(v=>v.trim()).filter(Boolean)}:x)})}/></label>
        </div>)}
        <Button variant="outline" onClick={()=>update({experience:[...value.experience,{id:crypto.randomUUID(),company:"",title:"",location:"",period:"",contributions:[]}]})}><Plus className="mr-2 h-4 w-4"/>Add position</Button>
      </div>}
      {active === "additional" && <div className="space-y-4">
        {([["leadership","Leadership and volunteering"],["professionalDevelopment","Professional development"],["professionalStrengths","Professional strengths"],["languages","Languages and proficiency"]] as const).map(([field,label]) => <label key={field} className="block text-sm font-medium">{label} <span className="font-normal text-muted-foreground">(one entry per line)</span><Textarea className="mt-1" rows={5} value={value[field].join("\n")} onChange={e=>update({[field]:e.target.value.split("\n").map(v=>v.trim()).filter(Boolean)})}/></label>)}
        <label className="block text-sm font-medium">References<Textarea className="mt-1" rows={2} value={value.references} onChange={e=>update({references:e.target.value})}/></label>
      </div>}
      {active === "education" && <div className="space-y-4">
        {value.education.map((item,index)=><div key={item.id} className="rounded-lg border border-border p-3">
          <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold">Education {index+1}</h3><Button size="sm" variant="ghost" aria-label={`Remove education ${index+1}`} onClick={()=>update({education:value.education.filter(x=>x.id!==item.id)})}><Trash2 className="h-4 w-4"/></Button></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {(["school","qualification","field","period","location"] as const).map(field=><label key={field} className="text-sm font-medium capitalize">{field}<Input className="mt-1" value={item[field]} onChange={e=>update({education:value.education.map(x=>x.id===item.id?{...x,[field]:e.target.value}:x)})}/></label>)}
          </div>
          <label className="mt-3 block text-sm font-medium">Details<Textarea className="mt-1" rows={3} value={item.description} onChange={e=>update({education:value.education.map(x=>x.id===item.id?{...x,description:e.target.value}:x)})}/></label>
        </div>)}
        <Button variant="outline" onClick={()=>update({education:[...value.education,{id:crypto.randomUUID(),school:"",qualification:"",field:"",period:"",location:"",description:""}]})}><Plus className="mr-2 h-4 w-4"/>Add education</Button>
      </div>}
    </section>
  );
};
export default CvEditorPanel;

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { EducationEntry } from "@/data/education";
import type { Company, LeadershipEntry, Role, WorkshopEntry } from "@/data/profile";
import type { CvDocumentContent } from "@/data/cvDocumentContent";

type CvContentEditorProps = {
  content: CvDocumentContent;
  versionTitle: string;
  onChange: (content: CvDocumentContent) => void;
};

type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: "text" | "email" | "url";
  hint?: string;
};

const Field = ({ id, label, value, onChange, multiline = false, type = "text", hint }: FieldProps) => (
  <div className="min-w-0">
    <label className="mb-1 block text-sm font-medium text-foreground" htmlFor={id}>{label}</label>
    {multiline ? (
      <Textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} rows={3} />
    ) : (
      <Input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    )}
    {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
  </div>
);

type StringListProps = {
  id: string;
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
};

const StringListEditor = ({ id, label, values, onChange, placeholder }: StringListProps) => (
  <fieldset className="space-y-2">
    <legend className="mb-2 text-sm font-medium text-foreground">{label}</legend>
    {values.map((value, index) => (
      <div key={`${id}-${index}`} className="flex items-start gap-2">
        <Input
          aria-label={`${label} ${index + 1}`}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(values.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}
        />
        <Button
          type="button"
          variant="outline"
          aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
          onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}
        >
          Remove
        </Button>
      </div>
    ))}
    <Button type="button" variant="outline" onClick={() => onChange([...values, ""])}>Add {label.toLowerCase()}</Button>
  </fieldset>
);

const emptyRole = (): Role => ({
  title: "",
  employmentType: "",
  location: "",
  period: "",
  duration: "",
  summary: "",
  contributions: [],
  skills: [],
});

const emptyCompany = (): Company => ({
  company: "",
  location: "",
  totalPeriod: "",
  roles: [emptyRole()],
});

const emptyEducation = (): EducationEntry => ({
  school: "",
  qualification: "",
  field: "",
  period: "",
  location: "",
  description: "",
  activities: [],
  coursework: [],
});

const emptyLeadership = (): LeadershipEntry => ({
  company: "",
  title: "",
  location: "",
  totalPeriod: "",
  roles: [],
  employmentType: "",
  period: "",
  duration: "",
  summary: "",
  contributions: [],
  skills: [],
});

const emptyWorkshop = (): WorkshopEntry => ({
  title: "",
  organization: "",
  period: "",
  location: "",
  summary: "",
  highlights: [],
  skills: [],
});

const CvContentEditor = ({ content, versionTitle, onChange }: CvContentEditorProps) => {
  const set = <K extends keyof CvDocumentContent>(key: K, value: CvDocumentContent[K]) =>
    onChange({ ...content, [key]: value });

  const updateCompany = (companyIndex: number, patch: Partial<Company>) =>
    set("companies", content.companies.map((company, index) => index === companyIndex ? { ...company, ...patch } : company));
  const updateRole = (companyIndex: number, roleIndex: number, patch: Partial<Role>) =>
    updateCompany(companyIndex, {
      roles: content.companies[companyIndex].roles.map((role, index) => index === roleIndex ? { ...role, ...patch } : role),
    });
  const updateEducation = (entryIndex: number, patch: Partial<EducationEntry>) =>
    set("education", content.education.map((entry, index) => index === entryIndex ? { ...entry, ...patch } : entry));
  const updateLeadership = (entryIndex: number, patch: Partial<LeadershipEntry>) =>
    set("leadership", content.leadership.map((entry, index) => index === entryIndex ? { ...entry, ...patch } : entry));
  const updateWorkshop = (entryIndex: number, patch: Partial<WorkshopEntry>) =>
    set("workshops", content.workshops.map((entry, index) => index === entryIndex ? { ...entry, ...patch } : entry));

  return (
    <section className="no-print mb-8 space-y-6 rounded-lg border border-border bg-muted/20 p-4 md:p-6" aria-labelledby="cv-editor-heading">
      <div>
        <h2 id="cv-editor-heading" className="text-xl font-semibold text-foreground">Editing: {versionTitle}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Preview updates as you type. Existing facts remain unchanged unless you edit them; no employers, dates, achievements, or trend claims are generated.
          Save before navigating away; unsaved drafts are discarded. Saved changes stay in this browser on this device (not encrypted or synced to an account or server).
          Shared links opened in another browser do not include these local edits; download the updated document to share it.
        </p>
      </div>

      <fieldset className="space-y-4 rounded-md border border-border p-4">
        <legend className="px-1 font-semibold">Profile details</legend>
        <div className="grid gap-3 md:grid-cols-2">
          <Field id="cv-name" label="Name" value={content.name} onChange={(value) => set("name", value)} />
          <Field id="cv-address" label="Location" value={content.address} onChange={(value) => set("address", value)} />
          <Field id="cv-email" label="Email" type="email" value={content.email} onChange={(value) => set("email", value)} />
          <Field id="cv-phone" label="Phone" value={content.phone} onChange={(value) => set("phone", value)} />
          <Field id="cv-linkedin" label="LinkedIn" type="url" value={content.linkedin} onChange={(value) => set("linkedin", value)} />
          <Field id="cv-references" label="References" value={content.references} onChange={(value) => set("references", value)} />
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-md border border-border p-4">
        <legend className="px-1 font-semibold">Professional summary and skills</legend>
        <Field id="cv-summary" label="Professional summary" multiline value={content.summary} onChange={(value) => set("summary", value)} />
        <StringListEditor id="cv-skill" label="Skills" values={content.coreSkills} onChange={(values) => set("coreSkills", values)} placeholder="Skill" />
        <StringListEditor id="cv-strength" label="Professional strengths" values={content.strengths} onChange={(values) => set("strengths", values)} placeholder="Strength" />
        <StringListEditor id="cv-achievement" label="Achievements" values={content.highlights} onChange={(values) => set("highlights", values)} placeholder="Achievement" />
      </fieldset>

      <fieldset className="space-y-5 rounded-md border border-border p-4">
        <legend className="px-1 font-semibold">Employment history</legend>
        {content.companies.map((company, companyIndex) => (
          <div key={`company-${companyIndex}`} className="space-y-4 rounded-md border border-border/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">Employer {companyIndex + 1}</h3>
              <Button type="button" variant="outline" onClick={() => set("companies", content.companies.filter((_, index) => index !== companyIndex))}>Remove employer</Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Field id={`company-${companyIndex}-name`} label="Employer" value={company.company} onChange={(value) => updateCompany(companyIndex, { company: value })} />
            </div>
            {company.roles.map((role, roleIndex) => (
              <div key={`role-${companyIndex}-${roleIndex}`} className="space-y-3 rounded-md bg-muted/30 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-medium">Role {roleIndex + 1}</h4>
                  <Button type="button" variant="outline" onClick={() => updateCompany(companyIndex, { roles: company.roles.filter((_, index) => index !== roleIndex) })}>Remove role</Button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field id={`role-${companyIndex}-${roleIndex}-title`} label="Job title" value={role.title} onChange={(value) => updateRole(companyIndex, roleIndex, { title: value })} />
                  <Field id={`role-${companyIndex}-${roleIndex}-employment`} label="Employment type" value={role.employmentType} onChange={(value) => updateRole(companyIndex, roleIndex, { employmentType: value })} />
                  <Field id={`role-${companyIndex}-${roleIndex}-location`} label="Work location" value={role.location} onChange={(value) => updateRole(companyIndex, roleIndex, { location: value })} />
                  <Field id={`role-${companyIndex}-${roleIndex}-period`} label="Dates" value={role.period} onChange={(value) => updateRole(companyIndex, roleIndex, { period: value })} hint="Keep the original wording or enter a range such as 2021 - Present." />
                </div>
                <Field id={`role-${companyIndex}-${roleIndex}-summary`} label="Role description" multiline value={role.summary} onChange={(value) => updateRole(companyIndex, roleIndex, { summary: value })} />
                <StringListEditor id={`role-${companyIndex}-${roleIndex}-contribution`} label="Responsibilities and achievements" values={role.contributions} onChange={(values) => updateRole(companyIndex, roleIndex, { contributions: values })} placeholder="Responsibility or achievement" />
                <StringListEditor id={`role-${companyIndex}-${roleIndex}-skill`} label="Role skills" values={role.skills} onChange={(values) => updateRole(companyIndex, roleIndex, { skills: values })} placeholder="Skill" />
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => updateCompany(companyIndex, { roles: [...company.roles, emptyRole()] })}>Add role</Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => set("companies", [...content.companies, emptyCompany()])}>Add employer</Button>
      </fieldset>

      <fieldset className="space-y-4 rounded-md border border-border p-4">
        <legend className="px-1 font-semibold">Education</legend>
        {content.education.map((entry, index) => (
          <div key={`education-${index}`} className="space-y-3 rounded-md border border-border/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">Education {index + 1}</h3>
              <Button type="button" variant="outline" onClick={() => set("education", content.education.filter((_, itemIndex) => itemIndex !== index))}>Remove education</Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Field id={`education-${index}-school`} label="Institution" value={entry.school} onChange={(value) => updateEducation(index, { school: value })} />
              <Field id={`education-${index}-qualification`} label="Qualification" value={entry.qualification} onChange={(value) => updateEducation(index, { qualification: value })} />
              <Field id={`education-${index}-field`} label="Field of study" value={entry.field} onChange={(value) => updateEducation(index, { field: value })} />
              <Field id={`education-${index}-location`} label="Location" value={entry.location} onChange={(value) => updateEducation(index, { location: value })} />
              <Field id={`education-${index}-period`} label="Dates" value={entry.period} onChange={(value) => updateEducation(index, { period: value })} />
            </div>
            <Field id={`education-${index}-description`} label="Description" multiline value={entry.description} onChange={(value) => updateEducation(index, { description: value })} />
            <StringListEditor id={`education-${index}-course`} label="Relevant coursework" values={entry.coursework ?? []} onChange={(values) => updateEducation(index, { coursework: values })} placeholder="Course" />
            <StringListEditor id={`education-${index}-activity`} label="Activities" values={entry.activities ?? []} onChange={(values) => updateEducation(index, { activities: values })} placeholder="Activity" />
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => set("education", [...content.education, emptyEducation()])}>Add education</Button>
      </fieldset>

      <fieldset className="space-y-4 rounded-md border border-border p-4">
        <legend className="px-1 font-semibold">Leadership and volunteering</legend>
        {content.leadership.map((entry, index) => (
          <div key={`leadership-${index}`} className="space-y-3 rounded-md border border-border/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">Experience {index + 1}</h3>
              <Button type="button" variant="outline" onClick={() => set("leadership", content.leadership.filter((_, itemIndex) => itemIndex !== index))}>Remove entry</Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Field id={`leadership-${index}-title`} label="Title" value={entry.title} onChange={(value) => updateLeadership(index, { title: value })} />
              <Field id={`leadership-${index}-organization`} label="Organization" value={entry.company} onChange={(value) => updateLeadership(index, { company: value })} />
              <Field id={`leadership-${index}-location`} label="Location" value={entry.location} onChange={(value) => updateLeadership(index, { location: value })} />
              <Field id={`leadership-${index}-period`} label="Dates" value={entry.period} onChange={(value) => updateLeadership(index, { period: value })} />
            </div>
            <Field id={`leadership-${index}-summary`} label="Description" multiline value={entry.summary} onChange={(value) => updateLeadership(index, { summary: value })} />
            <StringListEditor id={`leadership-${index}-contribution`} label="Responsibilities and achievements" values={entry.contributions} onChange={(values) => updateLeadership(index, { contributions: values })} placeholder="Responsibility or achievement" />
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => set("leadership", [...content.leadership, emptyLeadership()])}>Add leadership experience</Button>
      </fieldset>

      <fieldset className="space-y-4 rounded-md border border-border p-4">
        <legend className="px-1 font-semibold">Professional development</legend>
        {content.workshops.map((entry, index) => (
          <div key={`workshop-${index}`} className="space-y-3 rounded-md border border-border/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">Entry {index + 1}</h3>
              <Button type="button" variant="outline" onClick={() => set("workshops", content.workshops.filter((_, itemIndex) => itemIndex !== index))}>Remove entry</Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Field id={`workshop-${index}-title`} label="Course, workshop, or seminar" value={entry.title} onChange={(value) => updateWorkshop(index, { title: value })} />
              <Field id={`workshop-${index}-organization`} label="Organization" value={entry.organization} onChange={(value) => updateWorkshop(index, { organization: value })} />
              <Field id={`workshop-${index}-location`} label="Location" value={entry.location} onChange={(value) => updateWorkshop(index, { location: value })} />
              <Field id={`workshop-${index}-period`} label="Date" value={entry.period} onChange={(value) => updateWorkshop(index, { period: value })} />
            </div>
            <Field id={`workshop-${index}-summary`} label="Description" multiline value={entry.summary} onChange={(value) => updateWorkshop(index, { summary: value })} />
            <StringListEditor id={`workshop-${index}-highlight`} label="Highlights" values={entry.highlights} onChange={(values) => updateWorkshop(index, { highlights: values })} placeholder="Highlight" />
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => set("workshops", [...content.workshops, emptyWorkshop()])}>Add professional development</Button>
      </fieldset>

      <fieldset className="space-y-4 rounded-md border border-border p-4">
        <legend className="px-1 font-semibold">Languages</legend>
        {content.languages.map((language, index) => (
          <div key={`language-${index}`} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <Field id={`language-${index}-name`} label="Language" value={language.name} onChange={(value) => set("languages", content.languages.map((item, itemIndex) => itemIndex === index ? { ...item, name: value } : item))} />
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground" htmlFor={`language-${index}-level`}>Proficiency</label>
              <select
                id={`language-${index}-level`}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={language.proficiency}
                onChange={(event) => set("languages", content.languages.map((item, itemIndex) => itemIndex === index ? { ...item, proficiency: event.target.value === "Fluent" ? "Fluent" : "Conversational" } : item))}
              >
                <option value="Fluent">Fluent</option>
                <option value="Conversational">Conversational</option>
              </select>
            </div>
            <Button type="button" variant="outline" className="self-end" onClick={() => set("languages", content.languages.filter((_, itemIndex) => itemIndex !== index))}>Remove</Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => set("languages", [...content.languages, { name: "", proficiency: "Conversational" }])}>Add language</Button>
      </fieldset>
    </section>
  );
};

export default CvContentEditor;

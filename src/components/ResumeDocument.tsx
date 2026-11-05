import CvDocument from "@/components/CvDocument";
import type { CvDocumentContent } from "@/data/cvDocumentContent";
import type { CvVersion } from "@/data/cvVersions";

/**
 * Resume exports intentionally use the same approved ATS document format as
 * CV exports. The selected career track is an internal targeting mechanism and
 * is never rendered as the resume's visible job title or document heading.
 */
const ResumeDocument = ({ version, content }: { version: CvVersion; content?: CvDocumentContent }) => (
  <CvDocument version={version} content={content} documentType="resume" />
);

export default ResumeDocument;

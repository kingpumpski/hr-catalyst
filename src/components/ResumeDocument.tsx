import CvDocument from "@/components/CvDocument";
import type { CvVersion } from "@/data/cvVersions";

/**
 * Resume exports intentionally use the same approved ATS document format as
 * CV exports so every downloadable career document has a consistent identity,
 * typography, hierarchy and print layout.
 */
const ResumeDocument = ({ version }: { version: CvVersion }) => <CvDocument version={version} />;

export default ResumeDocument;

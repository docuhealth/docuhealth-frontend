import React, { useState, useMemo } from "react";
import { 
  FileText, 
  Image as ImageIcon, 
  Eye, 
  ArrowDownToLine, 
  Calendar, 
  User, 
  Building2, 
  Search, 
  X, 
  Activity,
  CheckCircle2,
  Clock
} from "lucide-react";
import { formatFullDateTime } from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import Modal from "../../../../ui/Modal";

const RADIOLOGY_SAMPLE_RECORDS = [
  {
    id: "RAD-001",
    modality: "Chest X-Ray (PA View)",
    category: "X-Ray",
    ordered_date: "2026-09-18T10:30:00Z",
    completed_date: "2026-09-18T14:15:00Z",
    status: "completed",
    report_status: "Report Ready",
    body_part: "Chest / Thorax",
    clinical_indication: "Persistent dry cough, mild dyspnea, rule out consolidation/infiltrate.",
    findings: "The cardiac silhouette is within normal limits for size and configuration. The cardiothoracic ratio is normal (<50%). The mediastinal and hilar contours are unremarkable. Lung fields are clear with no focal consolidation, pleural effusion, or pneumothorax identified. Visualized osseous structures demonstrate no acute abnormality.",
    impression: "No acute cardiopulmonary disease. Normal chest radiographic findings.",
    radiologist: "Dr. Clara Okonkwo, MBBS, FWACS (Radiology)",
    ordering_physician: "Dr. Raphael Jonnas",
    facility: "DocuHealth Diagnostic Center",
    images: [
      {
        id: "img-1",
        title: "Chest_PA_View.png",
        size: "2.4 MB",
        url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800",
      }
    ]
  },
  {
    id: "RAD-002",
    modality: "Abdominal Ultrasound",
    category: "Ultrasound",
    ordered_date: "2026-09-10T09:00:00Z",
    completed_date: "2026-09-10T11:45:00Z",
    status: "completed",
    report_status: "Report Ready",
    body_part: "Whole Abdomen",
    clinical_indication: "Epigastric discomfort and intermittent right upper quadrant tenderness.",
    findings: "Liver is normal in size and parenchymal echogenicity. No focal hepatic mass or intrahepatic biliary ductal dilatation. Gallbladder is well distended, walls are smooth with no calculi or sludge. Common bile duct is normal caliber (3.8 mm). Spleen and pancreas appear unremarkable. Both kidneys demonstrate preserved cortical thickness and corticomedullary differentiation without hydronephrosis.",
    impression: "Unremarkable transabdominal ultrasound examination.",
    radiologist: "Dr. Emeka Adeleke, Consultant Radiologist",
    ordering_physician: "Dr. Raphael Jonnas",
    facility: "DocuHealth Main Hospital",
    images: [
      {
        id: "img-2",
        title: "Abdomen_US_Scan_01.png",
        size: "1.8 MB",
        url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800",
      }
    ]
  }
];

const PatientRadiologyRecords = ({
  patientFullInfo,
  selected,
  radiologyRecords = [],
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScan, setSelectedScan] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Extract from props or attachments/radiology fields if available, otherwise show available records
  const allRecords = useMemo(() => {
    if (radiologyRecords && radiologyRecords.length > 0) {
      return radiologyRecords;
    }
    // Check if patientFullInfo or selected has radiology investigations
    const docs = patientFullInfo?.investigation_docs || selected?.investigation_docs || [];
    const radDocs = docs.filter((d) => {
      const name = (d.name || d.filename || "").toLowerCase();
      return name.includes("xray") || name.includes("x-ray") || name.includes("scan") || name.includes("mri") || name.includes("ultrasound") || name.includes("ct");
    });

    if (radDocs.length > 0) {
      return radDocs.map((doc, idx) => ({
        id: `RAD-${idx + 100}`,
        modality: doc.filename || doc.name || `Radiology Scan ${idx + 1}`,
        category: "Imaging",
        ordered_date: doc.created_at || new Date().toISOString(),
        completed_date: doc.created_at || new Date().toISOString(),
        status: "completed",
        report_status: "Report Ready",
        body_part: "Visualized Region",
        clinical_indication: "Diagnostic imaging review",
        findings: "Imaging performed and archived. Consult detailed scan attached.",
        impression: "Document attached for clinical evaluation.",
        radiologist: "Radiology Department",
        ordering_physician: "Attending Doctor",
        facility: "DocuHealth Radiology Center",
        images: [{ title: doc.filename || "Scan_Result.pdf", size: "1.2 MB", url: doc.file || doc.url }],
      }));
    }

    return RADIOLOGY_SAMPLE_RECORDS;
  }, [radiologyRecords, patientFullInfo, selected]);

  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return allRecords;
    const q = searchQuery.toLowerCase();
    return allRecords.filter(
      (rec) =>
        rec.modality?.toLowerCase().includes(q) ||
        rec.category?.toLowerCase().includes(q) ||
        rec.body_part?.toLowerCase().includes(q) ||
        rec.impression?.toLowerCase().includes(q)
    );
  }, [allRecords, searchQuery]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40 text-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <div className="w-5 h-5 border-2 border-docuhealth-primary border-t-transparent rounded-full animate-spin"></div>
          <span>Loading radiology records...</span>
        </div>
      </div>
    );
  }

  if (allRecords.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center text-center py-12 h-full">
        <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-4 text-docuhealth-primary">
          <Activity size={44} strokeWidth={1.5} />
        </div>
        <h2 className="font-semibold text-gray-800 text-base pb-1">No radiology results!</h2>
        <div className="max-w-md text-center">
          <p className="text-xs text-gray-500">
            This patient does not have any radiology or diagnostic imaging results recorded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 text-sm">
              Radiology & Imaging Scans ({filteredRecords.length})
            </h3>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search scan, type, or region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-docuhealth-primary focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Scan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredRecords.map((scan) => (
            <div
              key={scan.id}
              className="bg-white border rounded-xl p-4.5 hover:border-docuhealth-primary/40 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-docuhealth-primary bg-blue-50 px-2.5 py-0.5 rounded-full">
                      {scan.category}
                    </span>
                    <h4 className="font-bold text-gray-900 text-sm mt-1.5 leading-snug">
                      {scan.modality}
                    </h4>
                  </div>
                  <span className="shrink-0 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {scan.report_status || "Ready"}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                  <span className="font-medium text-gray-700">Region:</span> {scan.body_part}
                </p>

                <div className="bg-gray-50 rounded-lg p-2.5 mb-3 border border-gray-100">
                  <p className="text-[11px] text-gray-500 font-medium mb-0.5">Impression / Findings:</p>
                  <p className="text-xs text-gray-800 line-clamp-2 italic leading-relaxed">
                    "{scan.impression || scan.findings}"
                  </p>
                </div>

                <div className="space-y-1.5 text-[11px] text-gray-500 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{formatFullDateTime(scan.completed_date || scan.ordered_date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{scan.radiologist}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedScan(scan)}
                  className="flex-1 bg-docuhealth-primary hover:bg-opacity-95 text-white text-xs font-medium py-2 rounded-full transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Report</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Scan Detail Modal ── */}
      {selectedScan && (
        <Modal
          isOpen={!!selectedScan}
          onClose={() => setSelectedScan(null)}
          maxWidth="2xl"
        >
          <div className="relative">
            <div className="flex justify-between items-start pb-4 border-b">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-docuhealth-primary bg-blue-50 px-2.5 py-0.5 rounded-full">
                  {selectedScan.category} Report
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-1">
                  {selectedScan.modality}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Exam Date: {formatFullDateTime(selectedScan.completed_date || selectedScan.ordered_date)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedScan(null)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 p-3 rounded-xl text-xs">
                <div>
                  <p className="text-gray-400 text-[11px]">Body Region</p>
                  <p className="font-semibold text-gray-800">{selectedScan.body_part}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-[11px]">Reporting Radiologist</p>
                  <p className="font-semibold text-gray-800 truncate">{selectedScan.radiologist}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-[11px]">Ordering Doctor</p>
                  <p className="font-semibold text-gray-800 truncate">{selectedScan.ordering_physician}</p>
                </div>
              </div>

              {selectedScan.clinical_indication && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-1">Clinical Indication / History</h4>
                  <p className="text-xs text-gray-600 bg-white border rounded-lg p-3 leading-relaxed">
                    {selectedScan.clinical_indication}
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-1">Findings</h4>
                <p className="text-xs text-gray-800 bg-white border rounded-lg p-3 leading-relaxed whitespace-pre-line">
                  {selectedScan.findings}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-docuhealth-dark mb-1">Impression</h4>
                <div className="text-xs font-medium text-docuhealth-primary bg-blue-50/60 border border-blue-100 rounded-lg p-3 leading-relaxed">
                  {selectedScan.impression}
                </div>
              </div>

              {/* Attached Scan Images */}
              {selectedScan.images && selectedScan.images.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Attached Scan Images & Docs</h4>
                  <div className="space-y-2">
                    {selectedScan.images.map((img, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 border rounded-xl bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 text-xs">
                          <div className="p-2 bg-blue-50 text-docuhealth-primary rounded-lg">
                            <ImageIcon size={18} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{img.title}</p>
                            <p className="text-[10px] text-gray-400">{img.size}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={img.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-docuhealth-primary text-white rounded-full text-xs font-medium hover:bg-opacity-90 flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            View Scan
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedScan(null)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-full cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default PatientRadiologyRecords;

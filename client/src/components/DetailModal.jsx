import React, { useEffect } from 'react';
import { X, Pill, Heart, Stethoscope, Calendar, FileText, AlertCircle, Activity, History } from 'lucide-react';

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
};

const parseUpdates = (note) => {
  if (!note) return { healthUpdates: [], medicalHistory: [] };
  
  const lines = note.split('\n').filter(line => line.trim());
  const healthUpdates = [];
  const medicalHistory = [];

  lines.forEach(line => {
    const dateMatch = line.match(/^(\d{4}-\d{2}-\d{2}):\s*(.*)/);
    if (dateMatch) {
      const [_, date, content] = dateMatch;
      
      if (content.toLowerCase().includes('updated disease:') || 
          content.toLowerCase().includes('updated medication:')) {
        healthUpdates.push({
          date,
          disease: content.match(/updated disease:\s*([^,]+)/i)?.[1]?.trim(),
          medication: content.match(/updated medication:\s*([^,]+)/i)?.[1]?.trim(),
          content
        });
      } else {
        medicalHistory.push({ date, content });
      }
    }
  });

  return { healthUpdates, medicalHistory };
};

const formatClinicalNote = (note) => {
  if (!note) return [];
  
  return note.split('\n').filter(line => line.trim()).map(line => {
    const dateMatch = line.match(/^(\d{4}-\d{2}-\d{2}T[\d:.]+Z):\s*(.*)/);
    if (dateMatch) {
      return {
        date: dateMatch[1],
        content: dateMatch[2].trim()
      };
    }
    return {
      content: line.trim()
    };
  });
};

const InfoSection = ({ icon: Icon, title, children }) => (
  <div className="mb-6 last:mb-0 w-full">
    <div className="flex flex-wrap items-center gap-2 mb-3">
      <Icon className="h-5 w-5 text-teal-600 flex-shrink-0" />
      <h3 className="text-lg font-semibold text-gray-900 break-words">{title}</h3>
    </div>
    <div className="pl-7 w-full">{children}</div>
  </div>
);

const Field = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="mb-4 last:mb-0 w-full">
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-1">
        {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
        <span className="break-words">{label}</span>
      </div>
      <div className="text-gray-900 break-words">{value}</div>
    </div>
  );
};

const DetailModal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .detail-modal-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      .detail-modal-scrollbar::-webkit-scrollbar-track {
        background: rgba(13, 148, 136, 0.1);
        border-radius: 10px;
      }
      .detail-modal-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #0d9488, #0f766e);
        border-radius: 10px;
        transition: all 0.3s ease;
      }
      .detail-modal-scrollbar::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, #0f766e, #0d9488);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div
        className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap justify-between items-center p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 break-words pr-8">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-teal-600 transition-colors duration-200"
          >
            <X className="h-6 w-6 flex-shrink-0" />
          </button>
        </div>
        
        <div className="p-4 sm:p-6 overflow-y-auto detail-modal-scrollbar flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

const HealthStatusModal = ({ isOpen, onClose, patient }) => {
  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detailed Health Status"
    >
      <div className="space-y-6 w-full">
        <InfoSection icon={Activity} title="Current Health Status">
          <Field icon={AlertCircle} label="Disease" value={patient?.healthStatus?.[0]?.disease} />
          <Field icon={Pill} label="Medication" value={patient?.healthStatus?.[0]?.medication} />
        </InfoSection>

        <InfoSection icon={FileText} title="Clinical Notes">
          {formatClinicalNote(patient?.healthStatus?.[0]?.note).map((note, index) => (
            <div key={index} className="border-l-4 border-teal-200 pl-4 py-2 mb-4 w-full">
              {note.date && (
                <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span className="break-all">{formatDate(note.date)}</span>
                </div>
              )}
              <p className="text-gray-700 break-words">{note.content}</p>
            </div>
          ))}
        </InfoSection>

        {patient?.healthStatus?.[0]?.additionalDetails && (
          <InfoSection icon={FileText} title="Additional Details">
            <p className="text-gray-700 break-words">{patient.healthStatus[0].additionalDetails}</p>
          </InfoSection>
        )}
      </div>
    </DetailModal>
  );
};

const MedicalHistoryModal = ({ isOpen, onClose, patient }) => {
  const { healthUpdates, medicalHistory } = parseUpdates(patient?.healthStatus?.[0]?.note);
  
  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title="Comprehensive Medical History"
    >
      <div className="space-y-6 w-full">
        <InfoSection icon={History} title="Past Medical Conditions">
          <div className="prose max-w-none w-full">
            <p className="whitespace-pre-wrap text-gray-900 break-words">
              {patient?.medicalHistory?.history || 'No detailed medical history available'}
            </p>
          </div>
        </InfoSection>

        {patient?.medicalHistory?.additionalDetails && (
          <InfoSection icon={FileText} title="Additional Medical Insights">
            <p className="text-gray-700 break-words">{patient.medicalHistory.additionalDetails}</p>
          </InfoSection>
        )}
      </div>
    </DetailModal>
  );
};

export { DetailModal, HealthStatusModal, MedicalHistoryModal };
import React from 'react';
import { Settings2 } from 'lucide-react';
import { FormCheckbox } from '@/components/Common/FormInput';

interface DisplaySettingsSectionProps {
  formData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const Section: React.FC<{
  title: string;
  icon: React.ReactNode;
  iconBg?: string;
  children: React.ReactNode;
}> = ({ title, icon, iconBg = 'bg-amber-100', children }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
    <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
      <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center`}>
        {icon}
      </div>
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
    </div>
    {children}
  </div>
);

export const DisplaySettingsSection: React.FC<DisplaySettingsSectionProps> = ({
  formData,
  onChange
}) => (
  <Section title="Display Settings" icon={<Settings2 className="w-4 h-4 text-gray-600" />} iconBg="bg-gray-100">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <FormCheckbox
          label="Active"
          name="is_active"
          checked={formData.is_active}
          onChange={onChange}
        />
      </div>
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <FormCheckbox
          label="Featured"
          name="is_featured"
          checked={formData.is_featured}
          onChange={onChange}
        />
      </div>
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <FormCheckbox
          label="Show on Homepage"
          name="show_on_homepage"
          checked={formData.show_on_homepage}
          onChange={onChange}
        />
      </div>
    </div>
  </Section>
);


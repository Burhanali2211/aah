import React from 'react';
import { Globe } from 'lucide-react';
import { FormInput, FormTextarea } from '@/components/Common/FormInput';

interface SEOSectionProps {
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

export const SEOSection: React.FC<SEOSectionProps> = ({
  formData,
  onChange
}) => (
  <Section title="SEO" icon={<Globe className="w-4 h-4 text-teal-600" />} iconBg="bg-teal-50">
    <FormInput
      label="Meta Title"
      name="meta_title"
      value={formData.meta_title}
      onChange={onChange}
      placeholder="SEO title (leave empty to use product name)"
    />
    <FormTextarea
      label="Meta Description"
      name="meta_description"
      value={formData.meta_description}
      onChange={onChange}
      rows={2}
      placeholder="SEO description (leave empty to use short description)"
    />
  </Section>
);


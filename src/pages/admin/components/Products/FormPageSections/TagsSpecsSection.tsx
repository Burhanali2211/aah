import React from 'react';
import { Tag } from 'lucide-react';
import { FormTextarea } from '@/components/Common/FormInput';

interface TagsSpecsSectionProps {
  formData: any;
  errors: any;
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

export const TagsSpecsSection: React.FC<TagsSpecsSectionProps> = ({
  formData,
  errors,
  onChange
}) => (
  <Section title="Tags & Specifications" icon={<Tag className="w-4 h-4 text-purple-600" />} iconBg="bg-purple-50">
    <FormTextarea
      label="Tags"
      name="tags"
      value={formData.tags}
      onChange={onChange}
      rows={2}
      placeholder="rose, attar, alcohol-free (comma-separated)"
      helperText="Separate tags with commas"
    />

    <FormTextarea
      label="Specifications (JSON)"
      name="specifications"
      value={formData.specifications}
      onChange={onChange}
      rows={5}
      placeholder='{"brand": "Aligarh Attar House", "volume": "5ml", "type": "Pure Attar"}'
      error={errors.specifications || ''}
      helperText='Enter as JSON. Example: {"key": "value"}'
      className="font-mono text-sm"
    />
  </Section>
);


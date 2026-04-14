import React from 'react';
import { Package } from 'lucide-react';
import { FormInput, FormTextarea, FormSelect } from '@/components/Common/FormInput';

interface BasicInfoSectionProps {
  formData: any;
  errors: any;
  categoryOptions: any[];
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

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  errors,
  categoryOptions,
  onChange
}) => (
  <Section title="Basic Information" icon={<Package className="w-4 h-4 text-amber-600" />}>
    <FormInput
      label="Product Name *"
      name="name"
      value={formData.name}
      onChange={onChange}
      error={errors.name || ''}
      required
      placeholder="e.g. Premium Rose Attar"
    />

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormInput
        label="Slug"
        name="slug"
        value={formData.slug}
        onChange={onChange}
        helperText="Auto-generated from name"
        placeholder="premium-rose-attar"
      />

      <FormSelect
        label="Category *"
        name="category_id"
        value={formData.category_id}
        onChange={onChange}
        error={errors.category_id || ''}
        required
        options={categoryOptions}
      />
    </div>

    <FormTextarea
      label="Short Description"
      name="short_description"
      value={formData.short_description}
      onChange={onChange}
      rows={2}
      placeholder="Brief description shown in product listings"
    />

    <FormTextarea
      label="Full Description"
      name="description"
      value={formData.description}
      onChange={onChange}
      rows={5}
      placeholder="Detailed product description"
    />
  </Section>
);


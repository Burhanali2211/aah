import React from 'react';
import { motion } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { ProductFormData } from '../types';

interface SEOSectionProps {
  formData: ProductFormData;
  onChange: (field: string, value: any) => void;
  onArrayChange: (field: string, value: string) => void;
  onRemoveArrayItem: (field: string, index: number) => void;
}

export const SEOSection: React.FC<SEOSectionProps> = ({
  formData,
  onChange,
  onArrayChange,
  onRemoveArrayItem
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          SEO Title
        </label>
        <input
          type="text"
          value={formData.seo_title || ''}
          onChange={(e) => onChange('seo_title', e.target.value)}
          className="w-full px-4 py-3 bg-background-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="SEO optimized title"
          maxLength={60}
        />
        <p className="text-sm text-text-secondary mt-1">
          {(formData.seo_title || '').length}/60 characters
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          SEO Description
        </label>
        <textarea
          value={formData.seo_description || ''}
          onChange={(e) => onChange('seo_description', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 bg-background-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="SEO meta description"
          maxLength={160}
        />
        <p className="text-sm text-text-secondary mt-1">
          {(formData.seo_description || '').length}/160 characters
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemoveArrayItem('tags', index)}
                className="hover:text-primary-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a tag"
            className="flex-1 px-4 py-2 bg-background-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const input = e.target as HTMLInputElement;
                if (input.value.trim()) {
                  onArrayChange('tags', input.value);
                  input.value = '';
                }
              }
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              const input = (e.currentTarget as HTMLButtonElement).previousElementSibling as HTMLInputElement;
              if (input.value.trim()) {
                onArrayChange('tags', input.value);
                input.value = '';
              }
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};


import React from 'react';
import { motion } from 'framer-motion';
import { ProductFormData, Category } from '../types';

interface BasicInfoSectionProps {
  formData: ProductFormData;
  categories: Category[];
  onChange: (field: string, value: any) => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  categories,
  onChange
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Product Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            className="w-full px-4 py-3 bg-background-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter product name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            URL Slug
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => onChange('slug', e.target.value)}
            className="w-full px-4 py-3 bg-background-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="product-url-slug"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Short Description
        </label>
        <textarea
          value={formData.short_description}
          onChange={(e) => onChange('short_description', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 bg-background-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Brief product description for listings"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Full Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          rows={6}
          className="w-full px-4 py-3 bg-background-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Detailed product description"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Category *
          </label>
          <select
            value={formData.category_id}
            onChange={(e) => onChange('category_id', e.target.value)}
            className="w-full px-4 py-3 bg-background-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Brand
          </label>
          <input
            type="text"
            value={formData.brand}
            onChange={(e) => onChange('brand', e.target.value)}
            className="w-full px-4 py-3 bg-background-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Brand name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Model
          </label>
          <input
            type="text"
            value={formData.model || ''}
            onChange={(e) => onChange('model', e.target.value)}
            className="w-full px-4 py-3 bg-background-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Model number"
          />
        </div>
      </div>
    </motion.div>
  );
};


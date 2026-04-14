import React from 'react';
import { motion } from 'framer-motion';
import { Tag } from 'lucide-react';
import { ProductFormData } from '../types';

interface PricingSectionProps {
  formData: ProductFormData;
  onChange: (field: string, value: any) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  formData,
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
            Regular Price *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => onChange('price', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 bg-background-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Sale Price
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.sale_price || ''}
            onChange={(e) => onChange('sale_price', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-4 py-3 bg-background-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Compare at Price (₹)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.compare_at_price || ''}
            onChange={(e) => onChange('compare_at_price', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-4 py-3 bg-background-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="0.00"
          />
          <p className="text-sm text-text-secondary mt-1">
            Original price before discount
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Cost Price (₹)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.cost_price || ''}
            onChange={(e) => onChange('cost_price', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-4 py-3 bg-background-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="0.00"
          />
          <p className="text-sm text-text-secondary mt-1">
            Your cost (for profit calculations)
          </p>
        </div>
      </div>

      {formData.discount_percentage > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">
              {formData.discount_percentage}% Discount
            </span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Customers save ₹{(formData.price - (formData.sale_price || formData.price)).toLocaleString('en-IN')}
          </p>
        </div>
      )}
    </motion.div>
  );
};


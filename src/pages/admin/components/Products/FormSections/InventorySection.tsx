import React from 'react';
import { motion } from 'framer-motion';
import { ProductFormData } from '../types';

interface InventorySectionProps {
  formData: ProductFormData;
  onChange: (field: string, value: any) => void;
}

export const InventorySection: React.FC<InventorySectionProps> = ({
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
            SKU
          </label>
          <input
            type="text"
            value={formData.sku}
            onChange={(e) => onChange('sku', e.target.value)}
            className="w-full px-4 py-3 bg-background-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Product SKU"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Barcode
          </label>
          <input
            type="text"
            value={formData.barcode || ''}
            onChange={(e) => onChange('barcode', e.target.value)}
            className="w-full px-4 py-3 bg-background-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Product barcode"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="track_inventory"
            checked={formData.track_inventory}
            onChange={(e) => onChange('track_inventory', e.target.checked)}
            className="w-4 h-4 text-primary-600 bg-background-secondary border-border-primary rounded focus:ring-primary-500"
          />
          <label htmlFor="track_inventory" className="text-sm font-medium text-text-primary">
            Track inventory quantity
          </label>
        </div>

        {formData.track_inventory && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Inventory Quantity
              </label>
              <input
                type="number"
                min="0"
                value={formData.inventory_quantity}
                onChange={(e) => onChange('inventory_quantity', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-background-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                When out of stock
              </label>
              <select
                value={formData.inventory_policy}
                onChange={(e) => onChange('inventory_policy', e.target.value)}
                className="w-full px-4 py-3 bg-background-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="deny">Stop selling</option>
                <option value="continue">Continue selling</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-text-primary">Product Status</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => onChange('is_active', e.target.checked)}
              className="w-4 h-4 text-primary-600 bg-background-secondary border-border-primary rounded focus:ring-primary-500"
            />
            <label htmlFor="is_active" className="text-sm text-text-primary">
              Active
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_featured"
              checked={formData.is_featured}
              onChange={(e) => onChange('is_featured', e.target.checked)}
              className="w-4 h-4 text-primary-600 bg-background-secondary border-border-primary rounded focus:ring-primary-500"
            />
            <label htmlFor="is_featured" className="text-sm text-text-primary">
              Featured
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_bestseller"
              checked={formData.is_bestseller}
              onChange={(e) => onChange('is_bestseller', e.target.checked)}
              className="w-4 h-4 text-primary-600 bg-background-secondary border-border-primary rounded focus:ring-primary-500"
            />
            <label htmlFor="is_bestseller" className="text-sm text-text-primary">
              Bestseller
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_new_arrival"
              checked={formData.is_new_arrival}
              onChange={(e) => onChange('is_new_arrival', e.target.checked)}
              className="w-4 h-4 text-primary-600 bg-background-secondary border-border-primary rounded focus:ring-primary-500"
            />
            <label htmlFor="is_new_arrival" className="text-sm text-text-primary">
              New Arrival
            </label>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


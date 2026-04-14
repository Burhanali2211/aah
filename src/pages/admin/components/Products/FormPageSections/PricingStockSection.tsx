import React from 'react';
import { DollarSign } from 'lucide-react';
import { FormInput } from '@/components/Common/FormInput';

interface PricingStockSectionProps {
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

export const PricingStockSection: React.FC<PricingStockSectionProps> = ({
  formData,
  errors,
  onChange
}) => (
  <Section
    title="Pricing & Stock"
    icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
    iconBg="bg-emerald-50"
  >
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <FormInput
        label="Sale Price (₹) *"
        name="price"
        type="number"
        step="0.01"
        value={formData.price}
        onChange={onChange}
        error={errors.price || ''}
        required
        placeholder="0.00"
      />

      <FormInput
        label="Original Price (₹)"
        name="original_price"
        type="number"
        step="0.01"
        value={formData.original_price}
        onChange={onChange}
        error={errors.original_price || ''}
        placeholder="0.00"
        helperText="Leave blank if no discount"
      />

      <FormInput
        label="Stock Qty *"
        name="stock"
        type="number"
        value={formData.stock}
        onChange={onChange}
        error={errors.stock || ''}
        required
        placeholder="0"
      />

      <FormInput
        label="Low Stock Alert"
        name="min_stock_level"
        type="number"
        value={formData.min_stock_level}
        onChange={onChange}
        placeholder="5"
        helperText="Alert threshold"
      />

      <FormInput
        label="SKU"
        name="sku"
        value={formData.sku}
        onChange={onChange}
        placeholder="PROD-001"
      />

      <FormInput
        label="Weight (kg)"
        name="weight"
        type="number"
        step="0.001"
        value={formData.weight}
        onChange={onChange}
        placeholder="0.000"
      />
    </div>

    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">Dimensions (cm) — optional</p>
      <div className="grid grid-cols-3 gap-3">
        <FormInput
          label="Length"
          name="dimensions_length"
          type="number"
          step="0.1"
          value={formData.dimensions_length}
          onChange={onChange}
          placeholder="0.0"
        />
        <FormInput
          label="Width"
          name="dimensions_width"
          type="number"
          step="0.1"
          value={formData.dimensions_width}
          onChange={onChange}
          placeholder="0.0"
        />
        <FormInput
          label="Height"
          name="dimensions_height"
          type="number"
          step="0.1"
          value={formData.dimensions_height}
          onChange={onChange}
          placeholder="0.0"
        />
      </div>
    </div>
  </Section>
);


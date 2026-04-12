import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, X, Info, DollarSign, Package, Upload, Star } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { ProductFormData, Category } from '../Admin/Products/types';

// Modular Sections
import { BasicInfoSection } from '../Admin/Products/FormSections/BasicInfoSection';
import { PricingSection } from '../Admin/Products/FormSections/PricingSection';
import { InventorySection } from '../Admin/Products/FormSections/InventorySection';
import { MediaSection } from '../Admin/Products/FormSections/MediaSection';
import { SEOSection } from '../Admin/Products/FormSections/SEOSection';

interface ProductionProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  initialData?: Partial<ProductFormData>;
  categories: Category[];
}

export const ProductionProductForm: React.FC<ProductionProductFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  categories
}) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '', slug: '', description: '', short_description: '',
    price: 0, sale_price: null, sku: '', category_id: '', category: '', brand: '', dimensions: { length: null, width: null, height: null },
    color_variants: [], size_variants: [],
    shipping_info: { free_shipping: false, shipping_class: 'standard' },
    seo_keywords: [], seo_title: '', seo_description: '', gallery_images: [], images: [], is_active: true,
    is_featured: false, is_bestseller: false, is_new_arrival: false,
    discount_percentage: 0, tags: [], inventory_quantity: 0,
    inventory_policy: 'deny', track_inventory: true, stock_quantity: 0, status: 'draft',
    weight_g: null, meta_title: '', meta_description: '', model: '', barcode: '',
    featured_image_url: '', video_url: '', compare_at_price: null, cost_price: null,
    ...(initialData as any)
  });

  const generateSlug = useCallback((name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }, []);

  const handleChange = useCallback((field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'name' && !initialData?.slug) newData.slug = generateSlug(value);
      if (field === 'name' && !initialData?.seo_title) newData.seo_title = value;
      if ((field === 'price' || field === 'sale_price') && newData.price && newData.sale_price) {
        newData.discount_percentage = Math.round(((newData.price - newData.sale_price) / newData.price) * 100);
      }
      return newData;
    });
  }, [generateSlug, initialData]);

  const handleArrayChange = useCallback((field: string, value: string) => {
    if (!value.trim()) return;
    setFormData(prev => ({
      ...prev, [field]: [...prev[field as keyof ProductFormData] as string[], value.trim()]
    }));
  }, []);

  const removeArrayItem = useCallback((field: string, index: number) => {
    setFormData(prev => ({
      ...prev, [field]: (prev[field as keyof ProductFormData] as string[]).filter((_, i) => i !== index)
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showNotification({ type: 'error', title: 'Validation Error', message: 'Product name is required' });
      return;
    }
    if (!formData.price || formData.price <= 0) {
      showNotification({ type: 'error', title: 'Validation Error', message: 'Valid price is required' });
      return;
    }
    const categoryExists = categories.some(c => c.id === formData.category_id);
    if (!formData.category_id || !categoryExists) {
      showNotification({ type: 'error', title: 'Validation Error', message: 'Please select a valid category' });
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      showNotification({ type: 'success', title: 'Product Saved', message: `Product "${formData.name}" saved successfully` });
      onClose();
    } catch (error) {
      showNotification({ type: 'error', title: 'Save Failed', message: 'Failed to save product. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, [formData, onSubmit, onClose, showNotification, categories]);

  const steps = [
    { id: 1, name: 'Basic Info', icon: Info },
    { id: 2, name: 'Pricing', icon: DollarSign },
    { id: 3, name: 'Inventory', icon: Package },
    { id: 4, name: 'Media', icon: Upload },
    { id: 5, name: 'SEO', icon: Star }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="bg-background-primary rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-border-primary">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">{initialData ? 'Edit Product' : 'Add New Product'}</h2>
              <p className="text-text-secondary mt-1">{initialData ? 'Update product information' : 'Create a new product for your store'}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-background-secondary rounded-lg transition-colors"><X className="w-6 h-6" /></button>
          </div>

          <div className="flex items-center justify-between p-6 bg-background-secondary overflow-x-auto no-scrollbar">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${currentStep === step.id ? 'bg-primary-600 text-white' : 'text-text-secondary hover:text-text-primary hover:bg-background-tertiary'}`}
                >
                  <step.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{step.name}</span>
                </button>
                {index < steps.length - 1 && <div className="w-8 h-px bg-border-primary mx-2" />}
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {currentStep === 1 && <BasicInfoSection formData={formData} categories={categories} onChange={handleChange} />}
              {currentStep === 2 && <PricingSection formData={formData} onChange={handleChange} />}
              {currentStep === 3 && <InventorySection formData={formData} onChange={handleChange} />}
              {currentStep === 4 && <MediaSection formData={formData} onChange={handleChange} />}
              {currentStep === 5 && <SEOSection formData={formData} onChange={handleChange} onArrayChange={handleArrayChange} onRemoveArrayItem={removeArrayItem} />}
            </div>
          </div>

          <div className="flex items-center justify-between p-6 border-t border-border-primary bg-background-secondary">
            <button
              type="button"
              onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()}
              className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              {currentStep === 1 ? 'Cancel' : 'Previous'}
            </button>
            <div className="flex gap-3">
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Product</>}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductionProductForm;

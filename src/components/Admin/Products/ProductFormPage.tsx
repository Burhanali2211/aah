import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useNotification } from '../../../contexts/NotificationContext';
import { useProducts } from '../../../contexts/ProductContext';
import { AdminDashboardLayout } from '../Layout/AdminDashboardLayout';

// Sections
import { BasicInfoSection } from './FormPageSections/BasicInfoSection';
import { PricingStockSection } from './FormPageSections/PricingStockSection';
import { MediaSection } from './FormPageSections/MediaSection';
import { TagsSpecsSection } from './FormPageSections/TagsSpecsSection';
import { DisplaySettingsSection } from './FormPageSections/DisplaySettingsSection';
import { SEOSection } from './FormPageSections/SEOSection';

interface FormData {
  name: string; slug: string; description: string; short_description: string;
  price: string; original_price: string; category_id: string; stock: string;
  min_stock_level: string; sku: string; weight: string;
  dimensions_length: string; dimensions_width: string; dimensions_height: string;
  tags: string; specifications: string; is_featured: boolean;
  is_active: boolean; show_on_homepage: boolean; meta_title: string;
  meta_description: string; images: string[];
}

interface FormErrors { [key: string]: string; }

export const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<FormData>({
    name: '', slug: '', description: '', short_description: '',
    price: '', original_price: '', category_id: '', stock: '0',
    min_stock_level: '5', sku: '', weight: '',
    dimensions_length: '', dimensions_width: '', dimensions_height: '',
    tags: '', specifications: '', is_featured: false, is_active: true,
    show_on_homepage: true, meta_title: '', meta_description: '', images: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const { showSuccess, showError } = useNotification();
  const { createProduct, updateProduct } = useProducts();

  useEffect(() => {
    fetchCategories();
    if (isEditMode && id) fetchProduct(id);
  }, [id, isEditMode]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('id, name, is_active, parent_id').eq('is_active', true).order('name', { ascending: true });
      if (error) throw error;
      setCategories(data || []);
    } catch (error) { console.error('Failed to fetch categories:', error); }
  };

  const fetchProduct = async (productId: string) => {
    try {
      setFetching(true);
      const { data: product, error } = await supabase.from('products').select('*').eq('id', productId).single();
      if (error) throw error;
      if (product) {
        const dimensions = product.dimensions || {};
        setFormData({
          name: product.name || '', slug: product.slug || '', description: product.description || '',
          short_description: product.short_description || '', price: product.price?.toString() || '',
          original_price: product.original_price?.toString() || '', category_id: product.category_id || '',
          stock: product.stock?.toString() || '0', min_stock_level: product.min_stock_level?.toString() || '5',
          sku: product.sku || '', weight: product.weight?.toString() || '',
          dimensions_length: dimensions.length?.toString() || '', dimensions_width: dimensions.width?.toString() || '',
          dimensions_height: dimensions.height?.toString() || '',
          tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
          specifications: product.specifications ? JSON.stringify(product.specifications, null, 2) : '',
          is_featured: product.is_featured || false, is_active: product.is_active !== undefined ? product.is_active : true,
          show_on_homepage: product.show_on_homepage !== undefined ? product.show_on_homepage : true,
          meta_title: product.meta_title || '', meta_description: product.meta_description || '', images: product.images || [],
        });
      }
    } catch (error: any) { showError('Error', error.message || 'Failed to load product'); navigate('/admin/products'); } finally { setFetching(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'name' && !isEditMode) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.category_id) newErrors.category_id = 'Category is required';
    if (formData.stock && parseInt(formData.stock) < 0) newErrors.stock = 'Stock cannot be negative';
    if (formData.original_price && parseFloat(formData.original_price) < parseFloat(formData.price)) newErrors.original_price = 'Must be greater than sale price';
    if (formData.specifications) { try { JSON.parse(formData.specifications); } catch { newErrors.specifications = 'Must be valid JSON'; } }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      const dimensions: any = {};
      if (formData.dimensions_length) dimensions.length = parseFloat(formData.dimensions_length);
      if (formData.dimensions_width) dimensions.width = parseFloat(formData.dimensions_width);
      if (formData.dimensions_height) dimensions.height = parseFloat(formData.dimensions_height);
      const tags = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      let specifications = null;
      if (formData.specifications) { specifications = JSON.parse(formData.specifications); }
      const productData: any = {
        name: formData.name, slug: formData.slug || undefined, description: formData.description || undefined,
        shortDescription: formData.short_description || undefined, price: parseFloat(formData.price),
        originalPrice: formData.original_price ? parseFloat(formData.original_price) : undefined,
        categoryId: formData.category_id, stock: parseInt(formData.stock), minStockLevel: parseInt(formData.min_stock_level),
        sku: formData.sku || undefined, weight: formData.weight ? parseFloat(formData.weight) : undefined,
        dimensions: Object.keys(dimensions).length > 0 ? dimensions : undefined,
        tags: tags.length > 0 ? tags : undefined, specifications, featured: formData.is_featured,
        isActive: formData.is_active, showOnHomepage: formData.show_on_homepage,
        metaTitle: formData.meta_title || undefined, metaDescription: formData.meta_description || undefined,
        images: Array.isArray(formData.images) ? formData.images : (formData.images ? [formData.images] : []),
      };
      if (isEditMode && id) { await updateProduct({ ...productData, id }); showSuccess('Success', 'Product updated'); }
      else { await createProduct(productData); showSuccess('Success', 'Product created'); }
      navigate('/admin/products');
    } catch (error: any) { showError('Error', error.message || 'Failed to save product'); } finally { setLoading(false); }
  };

  const parentCategories = categories.filter(c => !c.parent_id);
  const categoryOptions = [
    { value: '', label: 'Select a category' },
    ...parentCategories.flatMap(parent => {
      const children = categories.filter(c => c.parent_id === parent.id);
      return [{ value: parent.id, label: parent.name }, ...children.map(c => ({ value: c.id, label: `  ↳ ${c.name}` }))];
    }),
    ...categories.filter(c => c.parent_id && !parentCategories.find(p => p.id === c.parent_id)).map(c => ({ value: c.id, label: c.name })),
  ];

  if (fetching) {
    return (
      <AdminDashboardLayout title={isEditMode ? 'Edit Product' : 'Add Product'}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout
      title={isEditMode ? 'Edit Product' : 'Add New Product'}
      subtitle={isEditMode ? 'Update product information' : 'Create a new product for your store'}
    >
      <div className="max-w-3xl mx-auto space-y-5">
        <button
          onClick={() => navigate('/admin/products')}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </button>

        <form onSubmit={handleSubmit} className="space-y-5">
          <BasicInfoSection formData={formData} errors={errors} categoryOptions={categoryOptions} onChange={handleChange} />
          <PricingStockSection formData={formData} errors={errors} onChange={handleChange} />
          <MediaSection formData={formData} setFormData={setFormData} />
          <TagsSpecsSection formData={formData} errors={errors} onChange={handleChange} />
          <DisplaySettingsSection formData={formData} onChange={handleChange} />
          <SEOSection formData={formData} onChange={handleChange} />

          <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
            <button type="button" onClick={() => navigate('/admin/products')} disabled={loading} className="px-5 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors min-h-[48px]">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-5 py-3 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center gap-2 min-h-[48px]">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4" /> {isEditMode ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </AdminDashboardLayout>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  useProduct, 
  useCreateProductMutation, 
  useUpdateProductMutation, 
  useCategories 
} from '@/hooks/useProductQueries';
import { useNotification } from '@/contexts/NotificationContext';
import { Save, Loader2, ArrowLeft } from 'lucide-react';
import { AdminDashboardLayout } from './layout/AdminDashboardLayout';
import { Product } from '@/types';

// Sections
import { BasicInfoSection } from './components/Products/FormPageSections/BasicInfoSection';
import { PricingStockSection } from './components/Products/FormPageSections/PricingStockSection';
import { MediaSection } from './components/Products/FormPageSections/MediaSection';
import { TagsSpecsSection } from './components/Products/FormPageSections/TagsSpecsSection';
import { DisplaySettingsSection } from './components/Products/FormPageSections/DisplaySettingsSection';
import { SEOSection } from './components/Products/FormPageSections/SEOSection';

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
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const { data: categories = [] } = useCategories();

  const [formData, setFormData] = useState<FormData>({
    name: '', slug: '', description: '', short_description: '',
    price: '', original_price: '', category_id: '', stock: '0',
    min_stock_level: '5', sku: '', weight: '',
    dimensions_length: '', dimensions_width: '', dimensions_height: '',
    tags: '', specifications: '', is_featured: false, is_active: true,
    show_on_homepage: true, meta_title: '', meta_description: '', images: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  
  const { showSuccess, showError } = useNotification();
  
  const { data: product, isLoading: fetching } = useProduct(id);
  
  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();
  
  const loading = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (product) {
      const dimensions = product.dimensions || {};
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        short_description: product.shortDescription || '',
        price: product.price?.toString() || '',
        original_price: product.originalPrice?.toString() || '',
        category_id: product.categoryId || '',
        stock: product.stock?.toString() || '0',
        min_stock_level: product.minStockLevel?.toString() || '5',
        sku: product.sku || '',
        weight: product.weight?.toString() || '',
        dimensions_length: dimensions.length?.toString() || '',
        dimensions_width: dimensions.width?.toString() || '',
        dimensions_height: dimensions.height?.toString() || '',
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
        specifications: product.specifications ? JSON.stringify(product.specifications, null, 2) : '',
        is_featured: product.featured || false,
        is_active: product.isActive !== undefined ? product.isActive : true,
        show_on_homepage: product.showOnHomepage !== undefined ? product.showOnHomepage : true,
        meta_title: product.metaTitle || '',
        meta_description: product.metaDescription || '',
        images: product.images || [],
      });
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev: FormData) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev: FormData) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev: FormErrors) => ({ ...prev, [name]: '' }));
    if (name === 'name' && !isEditMode) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData((prev: FormData) => ({ ...prev, slug }));
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
      const dimensions: any = {};
      if (formData.dimensions_length) dimensions.length = parseFloat(formData.dimensions_length);
      if (formData.dimensions_width) dimensions.width = parseFloat(formData.dimensions_width);
      if (formData.dimensions_height) dimensions.height = parseFloat(formData.dimensions_height);
      const tags = formData.tags ? formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
      let specifications = null;
      if (formData.specifications) { specifications = JSON.parse(formData.specifications); }
      
      const productData: any = {
        name: formData.name,
        slug: formData.slug || undefined,
        description: formData.description || undefined,
        shortDescription: formData.short_description || undefined,
        price: parseFloat(formData.price),
        originalPrice: formData.original_price ? parseFloat(formData.original_price) : undefined,
        categoryId: formData.category_id,
        stock: parseInt(formData.stock),
        minStockLevel: parseInt(formData.min_stock_level),
        sku: formData.sku || undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        dimensions: Object.keys(dimensions).length > 0 ? dimensions : undefined,
        tags: tags.length > 0 ? tags : undefined,
        specifications,
        featured: formData.is_featured,
        isActive: formData.is_active,
        showOnHomepage: formData.show_on_homepage,
        metaTitle: formData.meta_title || undefined,
        metaDescription: formData.meta_description || undefined,
        images: Array.isArray(formData.images) ? formData.images : (formData.images ? [formData.images] : []),
        sellerId: product?.sellerId || 'common-seller-id',
        sellerName: product?.sellerName || 'Aligarh Attars',
        rating: product?.rating || 0,
        reviews: product?.reviews || [],
      };

      if (isEditMode && id) {
        await updateMutation.mutateAsync({ ...productData, id } as Product);
        showSuccess('Success', 'Product updated');
      } else {
        await createMutation.mutateAsync(productData as any);
        showSuccess('Success', 'Product created');
      }
      navigate('/admin/products');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save product';
      showError('Error', msg);
    }
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

import React from 'react';
import { motion } from 'framer-motion';
import { ImageUpload } from '@/components/Common/ImageUpload';
import { ProductFormData } from '../types';

interface MediaSectionProps {
  formData: ProductFormData;
  onChange: (field: string, value: any) => void;
}

export const MediaSection: React.FC<MediaSectionProps> = ({
  formData,
  onChange
}) => {
  // Combine featured image and gallery images for ImageUpload component
  const allImages = formData.featured_image_url 
    ? [formData.featured_image_url, ...formData.gallery_images.filter(img => img !== formData.featured_image_url)]
    : formData.gallery_images;

  // Get main image index (featured image is always first)
  const mainImageIndex = formData.featured_image_url ? 0 : -1;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Product Images
        </label>
        <ImageUpload
          value={allImages}
          onChange={(images) => {
            const imageArray = Array.isArray(images) ? images : [images];
            if (imageArray.length > 0) {
              // First image is featured, rest are gallery
              onChange('featured_image_url', imageArray[0]);
              onChange('gallery_images', imageArray.slice(1));
            } else {
              onChange('featured_image_url', '');
              onChange('gallery_images', []);
            }
          }}
          onMainImageChange={(index: number) => {
            const imageArray = Array.isArray(allImages) ? allImages : [allImages];
            if (imageArray.length > 0 && index < imageArray.length) {
              // Reorder so selected image is first (featured)
              const newImages = [imageArray[index], ...imageArray.filter((_: any, i: number) => i !== index)];
              onChange('featured_image_url', newImages[0]);
              onChange('gallery_images', newImages.slice(1));
            }
          }}
          mainImageIndex={mainImageIndex >= 0 ? 0 : -1}
          multiple={true}
          maxFiles={10}
          folder="products"
          label="Upload Product Images"
          helperText="Upload up to 10 product images. Click any image to set it as the main/featured product image."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Product Video URL
        </label>
        <input
          type="url"
          value={formData.video_url || ''}
          onChange={(e) => onChange('video_url', e.target.value)}
          className="w-full px-4 py-3 bg-background-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="https://youtube.com/watch?v=..."
        />
        <p className="text-sm text-text-secondary mt-1">
          YouTube, Vimeo, or direct video URL
        </p>
      </div>
    </motion.div>
  );
};


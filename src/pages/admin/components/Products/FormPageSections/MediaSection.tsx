import React from 'react';
import { Image } from 'lucide-react';
import { ImageUpload } from '@/components/Common/ImageUpload';

interface MediaSectionProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
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

export const MediaSection: React.FC<MediaSectionProps> = ({
  formData,
  setFormData
}) => (
  <Section title="Product Images" icon={<Image className="w-4 h-4 text-blue-600" />} iconBg="bg-blue-50">
    <ImageUpload
      value={formData.images}
      onChange={images => {
        if (typeof images === 'function') {
          setFormData((prev: any) => {
            const current = Array.isArray(prev.images) ? prev.images : prev.images ? [prev.images] : [];
            const next = images(current);
            return { ...prev, images: Array.isArray(next) ? next : [next] };
          });
        } else {
          setFormData((prev: any) => ({ ...prev, images: Array.isArray(images) ? images : [images] }));
        }
      }}
      onMainImageChange={(index: number) => {
        const imageArray = Array.isArray(formData.images) ? formData.images : [formData.images];
        if (imageArray.length > 0 && index < imageArray.length) {
          setFormData((prev: any) => ({
            ...prev,
            images: [imageArray[index], ...imageArray.filter((_: any, i: number) => i !== index)],
          }));
        }
      }}
      mainImageIndex={0}
      multiple
      maxFiles={10}
      folder="products"
      label="Upload Product Images"
      helperText="Upload up to 10 images. Tap any image to set it as the main photo."
    />
  </Section>
);


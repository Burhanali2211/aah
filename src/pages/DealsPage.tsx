import { useProductsQuery } from '../hooks/useProductQueries';
import { ProductCard } from '../components/Product/ProductCard';
import { motion } from 'framer-motion';
import { Tag, Percent, Loader2 } from 'lucide-react';

export const DealsPage: React.FC = () => {
  const { data, isLoading } = useProductsQuery(1, 40, { isSale: true });
  const dealProducts = data?.products || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
              <Percent className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Special Deals</h1>
              <p className="text-sm sm:text-base text-gray-500 mt-0.5">
                {dealProducts.length > 0
                  ? `${dealProducts.length} product${dealProducts.length !== 1 ? 's' : ''} on sale right now`
                  : 'Unbeatable prices on your favourite products'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Loader2 className="h-10 w-10 text-amber-500 animate-spin mb-4" />
            <p className="text-gray-500">Finding the best deals for you...</p>
          </div>
        ) : dealProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Tag className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No deals right now</h2>
            <p className="text-gray-500 max-w-sm">
              Check back soon — we update our deals regularly with exclusive discounts.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
          >
            {dealProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                layout
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DealsPage;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type NewsletterData = z.infer<typeof newsletterSchema>;

const Newsletter: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<NewsletterData>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = async (data: NewsletterData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Newsletter subscription:', data);
    setIsSubmitted(true);
    reset();
    
    // Reset success state after 3 seconds
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <section className="py-20 bg-gradient-to-r from-yellow-600 to-yellow-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="px-4"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Stay in Style
            </h2>
            <p className="text-lg sm:text-xl text-yellow-100 mb-8">
              Subscribe to our newsletter for exclusive deals, design tips, and the latest trends
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto px-4"
          >
            <div className="flex-1">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-white text-gray-900"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-yellow-100">{errors.email.message}</p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isSubmitting}
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Subscribe</span>
                  <Mail className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Success Message */}
          <AnimatePresence>
            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ duration: 0.3 }}
                className="mt-6 bg-white/20 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span className="text-white font-medium">Thanks for subscribing!</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-4 text-sm text-yellow-100"
          >
            Join 10,000+ subscribers. No spam, unsubscribe anytime.
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from '../../../../components/Toast';
import CancelConfirmationPopout from '../../../../components/order/CancelConfirmationPopout'; // Reuse or adjust for service requests
import Breadcrumb from '../../../../components/breadcrumb';
import { fetchServiceRequests, cancelServiceRequest } from '../../../../lib/api';
import { ServiceRequest } from '../../../../lib/index';

type RequestStatus = 'all' | 'pending' | 'inProgress' | 'completed' | 'cancelled';

export default function ServiceRequestsPage() {
  const t = useTranslations('serviceRequests');
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale: 'en' | 'ar' = pathname.split('/')[1] === 'en' ? 'en' : 'ar';
  const [activeTab, setActiveTab] = useState<RequestStatus>('all');
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelPopout, setShowCancelPopout] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState<string | null>(null);

  // Fetch service requests on mount
  useEffect(() => {
    const loadServiceRequests = async () => {
      try {
        const fetchedRequests = await fetchServiceRequests(currentLocale);
        setServiceRequests(fetchedRequests);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errors.fetchFailed'));
      } finally {
        setLoading(false);
      }
    };

    loadServiceRequests();
  }, [currentLocale, t]);

// Filter service requests based on active tab
  const filteredRequests = Array.isArray(serviceRequests)
    ? serviceRequests.filter(
        (request) => activeTab === 'all' || request.status === activeTab
      )
    : [];

  const toggleRequestDetails = (requestId: string) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
  };

  const initiateCancelRequest = (requestId: string) => {
    setRequestToCancel(requestId);
    setShowCancelPopout(true);
  };

  const handleCancelRequest = async () => {
    if (!requestToCancel) return;

    setShowCancelPopout(false);
    setLoading(true);
    try {
      await cancelServiceRequest(requestToCancel, currentLocale);
      setToastMessage(t('cancelSuccess'));
      setShowToast(true);
      setServiceRequests((prev) =>
        prev.map((request) =>
          request.id.toString() === requestToCancel ? { ...request, status: 'cancelled' } : request
        )
      );
    } catch (err) {
      setToastMessage(t('cancelError') || 'Failed to cancel service request');
      setShowToast(true);
      console.error('Cancel service request error:', err);
    } finally {
      setLoading(false);
      const fetchedRequests = await fetchServiceRequests(currentLocale);
      setServiceRequests(fetchedRequests);
      setRequestToCancel(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div
        className="min-h-screen bg-[var(--primary-bg)] flex flex-col"
        dir={currentLocale === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="max-w-3xl mx-auto w-full px-4 md:px-8 py-[7vh]">
          <div className="w-full rounded-lg">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="text-2xl font-semibold text-green-700 mb-4"
            >
              {t('title')}
            </motion.h1>
            <Breadcrumb pageName="servicerequests" />
          </div>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-green-100 rounded-lg p-4 shadow-sm">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="min-h-screen bg-[var(--primary-bg)] flex flex-col"
        dir={currentLocale === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="max-w-3xl mx-auto w-full px-4 md:px-8 py-[7vh]">
          <div className="w-full rounded-lg">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="text-2xl font-semibold text-green-700 mb-4"
            >
              {t('title')}
            </motion.h1>
            <Breadcrumb pageName="servicerequests" />
          </div>
          <div className="text-center text-red-500">
            <p>{error}</p>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => router.push(`/${currentLocale}/login`)}
            >
              {t('goToLogin')}
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[var(--primary-bg)] flex flex-col overflow-auto"
      dir={currentLocale === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="max-w-3xl mx-auto w-full px-4 md:px-8 py-[7vh]">
        <div className="flex mr-5 mb-4">
          <Breadcrumb pageName="servicerequests" />
        </div>
        <div className="w-full rounded-lg">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="text-2xl font-semibold text-green-700 mb-4"
          >
            {t('title')}
          </motion.h1>

          <motion.div
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
          >
            {/* Dropdown for mobile */}
            <div className="sm:hidden">
              <motion.select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as RequestStatus)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-green-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-300 transition-colors"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: 0.15 }}
                dir={currentLocale === 'ar' ? 'rtl' : 'ltr'}
              >
                {['all', 'pending', 'inProgress', 'completed', 'cancelled'].map((tab) => (
                  <option key={tab} value={tab}>
                    {t(tab)}
                  </option>
                ))}
              </motion.select>
            </div>

            {/* Buttons for larger screens */}
            <div className="hidden sm:flex flex-wrap gap-2 justify-center md:justify-start">
              {['all', 'pending', 'inProgress', 'completed', 'cancelled'].map((tab, index) => (
                <motion.button
                  key={tab}
                  whileHover={{ scale: 1.05, y: -2, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
                  whileTap={{ scale: 0.95, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-white text-black border border-green-200 shadow-sm'
                      : 'bg-transparent text-gray-600 hover:text-black border border-transparent hover:bg-green-50'
                  }`}
                  onClick={() => setActiveTab(tab as RequestStatus)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: 0.1 + index * 0.03 }}
                  aria-current={activeTab === tab ? 'true' : 'false'}
                >
                  {t(tab)}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Service Request Items */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
        >
          {filteredRequests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <p>{t('noRequests')}</p>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={() => router.push(`/${currentLocale}/services`)}
              >
                {t('requestNow')}
              </motion.button>
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredRequests.map((request, requestIndex) => (
                <motion.div
                  key={request.id}
                  className="bg-green-100 rounded-lg p-4 shadow-sm overflow-hidden"
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: requestIndex * 0.05 }}
                  layout
                >
                  <div className="flex flex-col md:flex-row justify-between mb-2">
                    <div>
                      <h2 className="text-lg font-medium">
                        {t('request')}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {new Date(request.created_at).toLocaleDateString(currentLocale, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center mt-2 md:mt-0">
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white ${
                          request.status === 'completed'
                            ? 'bg-green-500'
                            : request.status === 'cancelled'
                            ? 'bg-red-500'
                            : request.status === 'pending'
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                        }`}
                      >
                        {t(request.status)}
                      </motion.div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-center">
                      <div className="bg-white p-2 rounded-full mr-3">
                        <svg
                          className="h-5 w-5 text-gray-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14,2 14,8 20,8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10,9 9,9 8,9"></polyline>
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">{request.service?.name_en || 'Unknown Service'}</p>
                      </div>
                    </div>

                    <div className="flex justify-end items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
                        whileTap={{ scale: 0.95, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
                        className="text-green-700 hover:text-green-800 hover:bg-green-200 px-4 py-1 rounded-md flex flex-row items-center whitespace-nowrap"
                        onClick={() => toggleRequestDetails(request.id.toString())}
                        aria-expanded={expandedRequest === request.id.toString()}
                        aria-controls={`request-details-${request.id}`}
                      >
                        <span className="inline-flex">
                          {expandedRequest === request.id.toString() ? t('hideDetails') : t('viewDetails')}
                        </span>
                        <svg
                          className={`ml-1 h-4 w-4 transition-transform ${
                            expandedRequest === request.id.toString() ? 'rotate-180' : ''
                          }`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </motion.button>
                      {request.status === 'pending' && (
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
                          whileTap={{ scale: 0.95, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
                          className="text-red-500 hover:text-red-600 hover:bg-red-100 px-3 py-1 rounded-md flex flex-row items-center whitespace-nowrap"
                          onClick={() => initiateCancelRequest(request.id.toString())}
                        >
                          <span className="inline-flex">{t('cancelRequest')}</span>
                        </motion.button>
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedRequest === request.id.toString() && (
                      <motion.div
                        className="mt-4 bg-white rounded-lg p-4 overflow-hidden"
                        initial={{ opacity: 0, maxHeight: 0 }}
                        animate={{ opacity: 1, maxHeight: 1000 }}
                        exit={{ opacity: 0, maxHeight: 0 }}
                        transition={{
                          duration: 0.3,
                          ease: [0.4, 0, 0.2, 1],
                          opacity: { duration: 0.2 },
                        }}
                        id={`request-details-${request.id}`}
                      >
                        <p className="text-sm">{request.details}</p>
                        {request.address && (
                          <div className="mt-4">
                            <p className="font-medium">{t('address')}</p>
                            <p className="text-sm text-gray-600">
                              {request.address.title}, {request.address.city}, {request.address.address_line}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      </div>

      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
      <CancelConfirmationPopout
        isOpen={showCancelPopout}
        onClose={() => {
          setShowCancelPopout(false);
          setRequestToCancel(null);
        }}
        onConfirm={handleCancelRequest}
        orderCode={requestToCancel || ''} // Using ID for simplicity
        locale={currentLocale}
      />
    </div>
  );
}
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { StaticPageLayout } from './StaticPageLayout';

type FAQItem = {
  question: string;
  answer: string;
};

export function FAQPage() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: t('staticPages.faq.q1'),
      answer: t('staticPages.faq.a1'),
    },
    {
      question: t('staticPages.faq.q2'),
      answer: t('staticPages.faq.a2'),
    },
    {
      question: t('staticPages.faq.q3'),
      answer: t('staticPages.faq.a3'),
    },
    {
      question: t('staticPages.faq.q4'),
      answer: t('staticPages.faq.a4'),
    },
    {
      question: t('staticPages.faq.q5'),
      answer: t('staticPages.faq.a5'),
    },
    {
      question: t('staticPages.faq.q6'),
      answer: t('staticPages.faq.a6'),
    },
    {
      question: t('staticPages.faq.q7'),
      answer: t('staticPages.faq.a7'),
    },
  ];

  return (
    <StaticPageLayout
      title={t('staticPages.faq.title')}
      breadcrumbs={[{ label: t('staticPages.faq.title') }]}
      description={t('staticPages.faq.description')}
    >
      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between p-4 text-right bg-white dark:bg-tagadod-dark-card hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="font-medium text-tagadod-titles dark:text-tagadod-dark-titles text-sm md:text-base">
                  {faq.question}
                </span>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-tagadod-gray shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-tagadod-gray shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 text-sm text-tagadod-gray leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </StaticPageLayout>
  );
}

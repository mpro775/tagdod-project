import { useNavigate } from 'react-router-dom'
import { setOnboardingSeen } from '../../stores/onboardingStore'
import { gradients } from '../../theme'

export function OnboardingPage() {
  const navigate = useNavigate()

  const handleContinue = () => {
    setOnboardingSeen()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-tagadod-dark-bg">
      {/* Top section - شكل مقعّر أسفل (مطابق للتطبيق) */}
      <div className="flex-[6] relative min-h-[400px]">
        <svg width="0" height="0" aria-hidden="true">
          <defs>
            <clipPath id="onboarding-concave" clipPathUnits="objectBoundingBox">
              <path d="M 0 0 L 0 0.85 Q 0.5 1.15 1 0.85 L 1 0 Z" />
            </clipPath>
          </defs>
        </svg>
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: '#E6F7FF',
            clipPath: 'url(#onboarding-concave)',
          }}
        >
          {/* Pattern */}
          <div className="absolute inset-0 flex items-center justify-center opacity-40">
            <img
              src="/assets/icons/pattern.svg"
              alt=""
              className="w-[min(80%,320px)] object-contain"
            />
          </div>
          {/* Logo + صورة الـ onboarding */}
          <div className="relative z-10 flex flex-col items-center pt-[100px] pb-8">
            <img
              src="/assets/icons/app_logo.png"
              alt="Tagadod"
              className="h-[60px] w-auto object-contain"
            />
            <div className="h-[120px]" />
            <img
              src="/assets/onboarding/onboarding_image.png"
              alt=""
              className="h-[180px] w-auto object-contain"
            />
          </div>
        </div>
      </div>

      {/* القسم السفلي - نفس النصوص والأزرار */}
      <div className="flex-[3] px-6 py-6 flex flex-col justify-center bg-white dark:bg-tagadod-dark-bg">
        <p className="text-[28px] md:text-[30px] font-semibold text-tagadod-titles dark:text-tagadod-dark-titles leading-tight mb-0 text-start">
          منتجات كهربائية
        </p>
        <p className="text-[30px] md:text-[34px] font-bold text-tagadod-titles dark:text-tagadod-dark-titles leading-tight mb-2 text-start">
          آمنة بمعايير عالمية
        </p>
        <p className="text-[17px] md:text-[19px] text-tagadod-titles dark:text-tagadod-dark-titles mb-6 text-center">
          جودة تثق بها بين يديك!
        </p>
        <button
          onClick={handleContinue}
          className="w-full py-[14px] text-white font-semibold rounded-lg transition-opacity hover:opacity-90"
          style={{ background: gradients.linerGreen }}
        >
          إبدأ الآن
        </button>
      </div>
    </div>
  )
}

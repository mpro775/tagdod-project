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
    <div className="min-h-screen flex flex-col bg-[#F6FCFF] dark:bg-tagadod-dark-bg">
      <div className="relative flex-1 min-h-[54vh] overflow-hidden rounded-b-[42px] bg-[#DDF3FF]">
        <div className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-[#9BDFFF]/40 blur-2xl" />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-[#B6E8FF]/50 blur-2xl" />
        <div className="absolute inset-0 opacity-25">
          <img
            src="/assets/icons/pattern.svg"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>

        <div className="relative z-10 flex h-full flex-col items-center justify-between px-6 pt-12 pb-8 sm:pt-14">
          <img
            src="/assets/icons/app_logo.png"
            alt="Tagadod"
            className="h-14 w-auto object-contain sm:h-16"
          />

          <img
            src="/assets/onboarding/onboarding_image.png"
            alt="Tagadod onboarding"
            className="mx-auto mt-6 sm:mt-8 h-auto max-h-[34vh] w-full max-w-[360px] object-contain"
            loading="eager"
          />
        </div>
      </div>

      <div className="px-6 pt-8 pb-6 sm:px-8 sm:pt-10">
        <p className="text-[28px] md:text-[30px] font-semibold text-tagadod-titles dark:text-tagadod-dark-titles leading-tight mb-0 text-start">
          منتجات كهربائية
        </p>
        <p className="text-[30px] md:text-[34px] font-bold text-tagadod-titles dark:text-tagadod-dark-titles leading-tight mb-3 text-start">
          آمنة بمعايير عالمية
        </p>
        <p className="text-[17px] md:text-[19px] text-tagadod-titles dark:text-tagadod-dark-titles mb-7 text-start opacity-80">
          جودة تثق بها بين يديك!
        </p>
        <button
          onClick={handleContinue}
          className="w-full py-[14px] text-white font-semibold rounded-xl transition-transform duration-200 hover:opacity-95 active:scale-[0.99]"
          style={{ background: gradients.linerGreen }}
        >
          إبدأ الآن
        </button>
      </div>
    </div>
  )
}

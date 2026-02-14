const ONBOARDING_KEY = 'tagadod-onboarding-seen'

export function hasSeenOnboarding(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === 'true'
}

export function setOnboardingSeen(): void {
  localStorage.setItem(ONBOARDING_KEY, 'true')
}

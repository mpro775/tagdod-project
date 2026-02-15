import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, LocateFixed, MapPin } from 'lucide-react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L, { type LatLngExpression } from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'
import { GlobalButton, GlobalTextField } from '../../components/shared'
import * as addressService from '../../services/addressService'

const DEFAULT_CENTER: [number, number] = [15.3694, 44.191]

const CITIES = [
  'صنعاء',
  'عدن',
  'تعز',
  'الحديدة',
  'إب',
  'ذمار',
  'المكلا',
  'سيئون',
  'عمران',
  'حجة',
  'صعدة',
  'مأرب',
]

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

function MapClickListener({ onPick }: { onPick: (pos: [number, number]) => void }) {
  useMapEvents({
    click: (e) => onPick([e.latlng.lat, e.latlng.lng]),
  })
  return null
}

function MapCenterSync({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, Math.max(map.getZoom(), 14), { animate: true })
  }, [center, map])
  return null
}

export function SelectLocationPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [coords, setCoords] = useState<[number, number]>(DEFAULT_CENTER)
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [form, setForm] = useState({
    label: '',
    line1: '',
    city: '',
    notes: '',
  })

  const createMutation = useMutation({
    mutationFn: addressService.createAddress,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['addresses'] })
      navigate('/addresses', { replace: true })
    },
  })

  const canSave = useMemo(
    () => form.label.trim().length >= 2 && form.line1.trim().length >= 5 && !!form.city,
    [form],
  )

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('المتصفح لا يدعم تحديد الموقع')
      return
    }

    setLocating(true)
    setLocationError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords([position.coords.latitude, position.coords.longitude])
        setLocating(false)
      },
      () => {
        setLocationError('تعذر تحديد الموقع الحالي، اختر الموقع من الخريطة')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave || createMutation.isPending) return

    createMutation.mutate({
      label: form.label.trim(),
      line1: form.line1.trim(),
      city: form.city,
      details: form.notes.trim() || undefined,
      lat: coords[0],
      lng: coords[1],
    })
  }

  return (
    <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-tagadod-light-bg/95 dark:bg-tagadod-dark-bg/95 backdrop-blur border-b border-gray-200 dark:border-white/10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -mr-2 text-tagadod-titles dark:text-tagadod-dark-titles"
          aria-label="رجوع"
        >
          <ArrowRight size={24} />
        </button>
        <h1 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
          تحديد الموقع
        </h1>
        <div className="w-10" />
      </header>

      <div className="p-4 space-y-4 pb-28">
        <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm">
          <MapContainer center={coords as LatLngExpression} zoom={15} className="h-[320px] w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={coords as LatLngExpression} />
            <MapClickListener onPick={setCoords} />
            <MapCenterSync center={coords} />
          </MapContainer>
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-300 dark:border-white/20 text-tagadod-titles dark:text-tagadod-dark-titles"
          disabled={locating}
        >
          <LocateFixed size={18} />
          {locating ? 'جار تحديد موقعك...' : 'استخدم موقعي الحالي'}
        </button>

        {locationError && <p className="text-sm text-tagadod-red">{locationError}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <GlobalTextField
            label="اسم العنوان"
            placeholder="مثال: المنزل"
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            required
          />

          <GlobalTextField
            label="العنوان التفصيلي"
            placeholder="مثال: شارع تعز - جوار مستشفى..."
            value={form.line1}
            onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
            required
          />

          <div className="w-full">
            <label className="block text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles mb-1.5">
              المدينة
            </label>
            <select
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/10 text-tagadod-titles dark:text-tagadod-dark-titles border-0 focus:ring-2 focus:ring-primary outline-none"
              required
            >
              <option value="">اختر المدينة</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <GlobalTextField
            label="ملاحظات (اختياري)"
            placeholder="مثال: بجوار الصيدلية"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            multiline
            rows={2}
          />

          <div className="rounded-xl bg-white dark:bg-tagadod-dark-gray p-3 border border-gray-200 dark:border-white/10">
            <p className="text-xs text-tagadod-gray mb-1">إحداثيات الموقع المختار</p>
            <p className="text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles flex items-center gap-1.5">
              <MapPin size={14} className="text-primary" />
              {coords[0].toFixed(6)}, {coords[1].toFixed(6)}
            </p>
          </div>

          {createMutation.isError && (
            <p className="text-xs text-tagadod-red">
              {(createMutation.error as Error)?.message || 'تعذر حفظ العنوان'}
            </p>
          )}

          <GlobalButton type="submit" loading={createMutation.isPending} disabled={!canSave}>
            حفظ العنوان
          </GlobalButton>
        </form>
      </div>
    </div>
  )
}

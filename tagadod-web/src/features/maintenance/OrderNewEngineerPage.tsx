import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ChevronLeft, ImagePlus, X } from "lucide-react";
import { GlobalButton, GlobalTextField } from "../../components/shared";
import { createServiceRequest } from "../../services/maintenanceService";
import { getAddresses } from "../../services/addressService";
import { REQUEST_TYPE_LABELS } from "../../types/enums";
import type { RequestType } from "../../types/enums";

const REQUEST_TYPES = Object.entries(REQUEST_TYPE_LABELS) as [
  RequestType,
  string,
][];

export function OrderNewEngineerPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── form state ────────────────────────────────────────────────────
  const [type, setType] = useState<RequestType>("MAINTENANCE");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [addressId, setAddressId] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // ─── addresses ─────────────────────────────────────────────────────
  const addressesQuery = useQuery({
    queryKey: ["addresses"],
    queryFn: getAddresses,
  });
  const addresses = addressesQuery.data ?? [];

  // set default address when loaded
  if (addresses.length > 0 && !addressId) {
    const def = addresses.find((a) => a.isDefault) ?? addresses[0];
    if (def) setAddressId(def.id);
  }

  // ─── mutation ──────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: async () => {
      const imageUrls: string[] = [];
      if (imagePreview) {
        imageUrls.push(imagePreview);
      }
      return createServiceRequest({
        title: title.trim(),
        type,
        description: description.trim() || undefined,
        addressId,
        scheduledAt: new Date().toISOString(),
        images: imageUrls.length > 0 ? imageUrls : undefined,
      });
    },
    onSuccess: () => setShowSuccess(true),
  });

  const canSubmit = title.trim() && addressId;

  // ─── image handling ────────────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeImage = () => {
    setImagePreview(null);
  };

  // ─── render ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
      {/* header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
        <button onClick={() => navigate(-1)} className="p-2 -mr-2">
          <ChevronLeft
            size={24}
            className="rotate-180 text-tagadod-titles dark:text-tagadod-dark-titles"
          />
        </button>
        <h1 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
          {t("orderNewEngineer.title", "طلب مهندس جديد")}
        </h1>
      </header>

      {showSuccess ? (
        <div className="p-6 flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mb-6">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-secondary"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-tagadod-titles dark:text-tagadod-dark-titles mb-2">
            {t("orderNewEngineer.successTitle", "تم إرسال الطلب بنجاح")}
          </h3>
          <p className="text-tagadod-gray text-center mb-8">
            {t(
              "orderNewEngineer.successMessage",
              "سيتم إعلامك عند تلقي عروض من المهندسين",
            )}
          </p>
          <GlobalButton
            fullWidth={false}
            onClick={() => navigate("/maintenance-orders", { replace: true })}
            className="px-8"
          >
            {t("maintenanceOrders.continueOffers", "متابعة")}
          </GlobalButton>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) mutation.mutate();
          }}
          className="p-4 space-y-4"
        >
          {/* Request type */}
          <div>
            <label className="block text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles mb-1.5">
              {t("orderNewEngineer.requestType", "نوع الطلب")}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as RequestType)}
              className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/10 text-tagadod-titles dark:text-tagadod-dark-titles border-0 focus:ring-2 focus:ring-primary outline-none"
            >
              {REQUEST_TYPES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <GlobalTextField
            label={t("orderNewEngineer.requestTitle", "عنوان الطلب")}
            placeholder={t(
              "orderNewEngineer.requestTitleHint",
              "مثال: صيانة تكييف",
            )}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          {/* Description */}
          <GlobalTextField
            label={t("orderNewEngineer.description", "الوصف")}
            placeholder={t(
              "orderNewEngineer.descriptionHint",
              "اشرح المشكلة بالتفصيل...",
            )}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
          />

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles mb-1.5">
              {t("orderNewEngineer.address", "العنوان")}
            </label>
            {addressesQuery.isLoading ? (
              <div className="h-12 rounded-xl animate-pulse bg-gray-200 dark:bg-white/10" />
            ) : addresses.length === 0 ? (
              <button
                type="button"
                onClick={() => navigate("/addresses")}
                className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/20 text-primary text-sm"
              >
                {t("orderNewEngineer.addAddress", "أضف عنوان")}
              </button>
            ) : (
              <select
                value={addressId}
                onChange={(e) => setAddressId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/10 text-tagadod-titles dark:text-tagadod-dark-titles border-0 focus:ring-2 focus:ring-primary outline-none"
              >
                {addresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label || a.street || a.line1}{" "}
                    {a.city ? `• ${a.city}` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles mb-1.5">
              {t("orderNewEngineer.images", "صورة (اختياري)")}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <div className="flex flex-wrap gap-2">
              {imagePreview && (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden">
                  <img
                    src={imagePreview}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1 end-1 p-0.5 rounded-full bg-black/50 text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              {!imagePreview && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/20 flex items-center justify-center text-tagadod-gray hover:border-primary hover:text-primary transition-colors"
                >
                  <ImagePlus size={24} />
                </button>
              )}
            </div>
          </div>

          {/* Submit */}
          <GlobalButton
            type="submit"
            disabled={!canSubmit}
            loading={mutation.isPending}
            className="mt-6"
          >
            {t("orderNewEngineer.confirmOrder", "إرسال الطلب")}
          </GlobalButton>

          {mutation.isError && (
            <p className="text-sm text-tagadod-red text-center">
              {t("common.errorOccurred", "حدث خطأ، حاول مرة أخرى")}
            </p>
          )}
        </form>
      )}
    </div>
  );
}

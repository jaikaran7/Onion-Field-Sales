import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button.tsx";
import { Field } from "../../components/Field.tsx";
import { ErrorBlock, LoadingBlock, Screen } from "../../components/Screen.tsx";
import { StatusNote } from "../../components/StatusNote.tsx";
import { useOnline } from "../../hooks/useOnline.ts";
import { findShopByMobile, registerShop } from "../../services/customerService.ts";
import { listActiveQualities, listShopTypes } from "../../services/qualityService.ts";
import type { CustomerQuality, ShopDraft, ShopType } from "../../types/domain.ts";
import { compressImage } from "../../utils/compressImage.ts";
import { clearDraft, loadPhotoDraft, loadTextDraft, savePhotoDraft, saveTextDraft } from "../../utils/draft.ts";
import { isDuplicateError, saveErrorMessage } from "../../utils/errors.ts";
import { getCurrentLocation, isAcceptableAccuracy, locationErrorMessage, readGeoFailure } from "../../utils/location.ts";
import { generateGoogleMapsUrl } from "../../utils/maps.ts";
import { normalizeMobile } from "../../utils/phone.ts";

type Errors = Partial<Record<"shopName" | "ownerName" | "mobile" | "shopType" | "quality" | "photo" | "location", string>>;

export function AddShopPage() {
  const navigate = useNavigate();
  const online = useOnline();
  const submitting = useRef(false);
  const [draft, setDraft] = useState<ShopDraft>(() => loadTextDraft());
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [types, setTypes] = useState<ShopType[]>([]);
  const [qualities, setQualities] = useState<CustomerQuality[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [step, setStep] = useState<"edit" | "review">("edit");
  const [duplicate, setDuplicate] = useState<{ id: string | null; shopName: string } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState(() => savedLocationNote(loadTextDraft()).message);
  const [locationTone, setLocationTone] = useState<"good" | "warn" | "bad" | "neutral">(
    () => savedLocationNote(loadTextDraft()).tone,
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    loadPhotoDraft()
      .then((blob) => {
        if (!blob) return;
        const file = new File([blob], blob.type === "image/webp" ? "shop.webp" : "shop.jpg", { type: blob.type });
        setPhoto(file);
        setPreview(URL.createObjectURL(file));
      })
      .catch((error) => console.error("[draft-photo]", error));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => saveTextDraft(draft), 250);
    return () => window.clearTimeout(timer);
  }, [draft]);

  useEffect(() => {
    const dirty = draft.shopName || draft.ownerName || draft.mobileNumber || photo;
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [draft, photo]);

  function loadOptions() {
    setLoading(true);
    setLoadError("");
    Promise.all([listShopTypes(), listActiveQualities()])
      .then(([nextTypes, nextQualities]) => {
        setTypes(nextTypes);
        setQualities(nextQualities);
      })
      .catch((error) => setLoadError(error instanceof Error ? error.message : "Could not load the form."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadOptions();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function update(patch: Partial<ShopDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
    setDuplicate(null);
  }

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setPhoto(compressed);
      setPreview((current) => {
        if (current) URL.revokeObjectURL(current);
        return URL.createObjectURL(compressed);
      });
      await savePhotoDraft(compressed);
      setErrors((current) => ({ ...current, photo: undefined }));
    } catch (error) {
      console.error("[photo]", error);
      setErrors((current) => ({ ...current, photo: "This photo could not be prepared. Please take it again." }));
    }
  }

  async function captureLocation() {
    setLocating(true);
    setLocationMessage("");
    try {
      const fix = await getCurrentLocation();
      update({ latitude: fix.latitude, longitude: fix.longitude, accuracy: fix.accuracy });
      if (isAcceptableAccuracy(fix.accuracy)) {
        setLocationTone("good");
        setLocationMessage(`Location captured. Accuracy: ${Math.round(fix.accuracy)} meters`);
        setErrors((current) => ({ ...current, location: undefined }));
      } else {
        setLocationTone("warn");
        setLocationMessage("GPS accuracy is low. Please move to an open area and try again.");
      }
    } catch (error) {
      console.error("[location]", error);
      setLocationTone("bad");
      setLocationMessage(locationErrorMessage(readGeoFailure(error)));
    } finally {
      setLocating(false);
    }
  }

  function validate() {
    const next: Errors = {};
    if (!draft.shopName.trim()) next.shopName = "Please enter shop name.";
    if (!draft.ownerName.trim()) next.ownerName = "Please enter the owner name.";
    if (!normalizeMobile(draft.mobileNumber)) next.mobile = "Please enter a valid 10-digit mobile number.";
    if (!draft.shopTypeId) next.shopType = "Please select shop type.";
    if (!draft.customerQualityId) next.quality = "Please select customer quality.";
    if (!photo) next.photo = "Please capture the shop photo.";
    if (draft.latitude == null || draft.longitude == null || !isAcceptableAccuracy(draft.accuracy ?? 0)) {
      next.location = "Please capture your current location.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function review() {
    setSaveError("");
    if (!validate()) return;
    const mobile = normalizeMobile(draft.mobileNumber);
    if (!mobile) return;
    try {
      const existing = await findShopByMobile(mobile);
      if (existing) {
        setDuplicate(existing);
        return;
      }
      setStep("review");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not check this mobile number. Please try again.");
    }
  }

  async function submit() {
    if (submitting.current || saving) return;
    if (!photo || draft.latitude == null || draft.longitude == null || draft.accuracy == null) return;
    const mobile = normalizeMobile(draft.mobileNumber);
    if (!mobile || !isAcceptableAccuracy(draft.accuracy)) return;
    if (!online) {
      setSaveError("You are offline. The shop has not been saved. Stay on this screen and try again when the network returns.");
      return;
    }
    submitting.current = true;
    setSaving(true);
    setSaveError("");
    const qualityName = qualities.find((item) => item.id === draft.customerQualityId)?.quality_name ?? "";
    try {
      const existing = await findShopByMobile(mobile);
      if (existing) {
        setDuplicate(existing);
        setStep("edit");
        return;
      }
      await registerShop({
        id: crypto.randomUUID(),
        shopName: draft.shopName.trim(),
        ownerName: draft.ownerName.trim(),
        mobileNumber: mobile,
        address: draft.address.trim(),
        shopTypeId: draft.shopTypeId,
        customerQualityId: draft.customerQualityId,
        shortDescription: draft.shortDescription.trim(),
        photo,
        latitude: draft.latitude,
        longitude: draft.longitude,
        accuracy: draft.accuracy,
        mapsUrl: generateGoogleMapsUrl(draft.latitude, draft.longitude),
      });
      await clearDraft();
      navigate("/added", {
        replace: true,
        state: { shopName: draft.shopName.trim(), qualityName, locationCaptured: true },
      });
    } catch (error) {
      if (isDuplicateError(error)) {
        const existing = await findShopByMobile(mobile).catch(() => null);
        if (existing) setDuplicate(existing);
        setStep("edit");
        setSaveError("This mobile number already belongs to an existing shop.");
      } else {
        setSaveError(saveErrorMessage(error));
      }
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  if (loading) return <LoadingBlock label="Loading form..." />;
  if (loadError) return <ErrorBlock message={loadError} onRetry={loadOptions} />;

  if (step === "review" && photo && draft.latitude != null && draft.longitude != null) {
    const qualityName = qualities.find((item) => item.id === draft.customerQualityId)?.quality_name ?? "";
    return (
      <Screen
        title="Review shop"
        back={false}
        action={
          <Button onClick={() => void submit()} disabled={saving}>
            {saving ? "Saving..." : "Submit shop"}
          </Button>
        }
      >
        <button type="button" className="mb-3 min-h-11 text-[15px] font-semibold text-action" onClick={() => setStep("edit")}>
          Edit details
        </button>
        {preview ? <img src={preview} alt="Shop preview" className="mb-4 aspect-[4/3] w-full rounded-2xl object-cover" /> : null}
        <ReviewRow label="Shop" value={draft.shopName} />
        <ReviewRow label="Owner" value={draft.ownerName} />
        <ReviewRow label="Mobile" value={normalizeMobile(draft.mobileNumber) ?? draft.mobileNumber} />
        <ReviewRow label="Address" value={draft.address.trim() || "Not added"} />
        <ReviewRow label="Shop type" value={types.find((type) => type.id === draft.shopTypeId)?.type_name ?? ""} />
        <ReviewRow label="Customer quality" value={qualityName} />
        <ReviewRow label="Description" value={draft.shortDescription.trim() || "Not added"} />
        <div className="mt-3">
          <StatusNote tone="good">Location captured</StatusNote>
        </div>
        <a
          className="mt-3 flex min-h-12 items-center justify-center rounded-2xl border border-line bg-white font-semibold text-action"
          href={generateGoogleMapsUrl(draft.latitude, draft.longitude)}
          target="_blank"
          rel="noreferrer"
        >
          View on map
        </a>
        {saveError ? <p className="mt-3 text-[15px] text-bad">{saveError}</p> : null}
      </Screen>
    );
  }

  const mapsUrl =
    draft.latitude != null && draft.longitude != null ? generateGoogleMapsUrl(draft.latitude, draft.longitude) : "";

  return (
    <Screen
      title="Add new shop"
      subtitle="Take a photo and capture the location at the shop."
      action={
        <Button onClick={() => void review()} disabled={saving}>
          Review shop
        </Button>
      }
    >
      <div className="grid gap-5">
        <Field label="Shop name" error={errors.shopName}>
          <input className="control" value={draft.shopName} onChange={(event) => update({ shopName: event.target.value })} />
        </Field>
        <Field label="Owner / contact person" error={errors.ownerName}>
          <input className="control" value={draft.ownerName} onChange={(event) => update({ ownerName: event.target.value })} />
        </Field>
        <Field label="Mobile number" error={errors.mobile}>
          <input
            className="control"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={draft.mobileNumber}
            onChange={(event) => update({ mobileNumber: event.target.value })}
          />
        </Field>
        <Field label="Shop number / address">
          <input className="control" value={draft.address} onChange={(event) => update({ address: event.target.value })} />
        </Field>
        <Field label="Shop type *" error={errors.shopType}>
          <select className="control select-control" value={draft.shopTypeId} onChange={(event) => update({ shopTypeId: event.target.value })}>
            <option value="">Select shop type</option>
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.type_name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Customer quality *" error={errors.quality}>
          <select
            className="control select-control"
            value={draft.customerQualityId}
            onChange={(event) => update({ customerQualityId: event.target.value })}
          >
            <option value="">Select customer quality</option>
            {qualities.map((quality) => (
              <option key={quality.id} value={quality.id}>
                {quality.quality_name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Short description" hint={`${draft.shortDescription.length}/300`}>
          <textarea
            className="control"
            maxLength={300}
            placeholder="Briefly describe the shop, business type, onion requirement, current supplier, etc."
            value={draft.shortDescription}
            onChange={(event) => update({ shortDescription: event.target.value.slice(0, 300) })}
          />
        </Field>
        <Field label="Shop photo" error={errors.photo}>
          <PhotoBox
            preview={preview}
            onPick={(file) => void onPhoto(file)}
            onRemove={() => {
              setPhoto(null);
              setPreview((current) => {
                if (current) URL.revokeObjectURL(current);
                return null;
              });
              void savePhotoDraft(null);
            }}
          />
        </Field>
        <Field label="Current location" error={errors.location}>
          <Button variant="secondary" onClick={() => void captureLocation()} disabled={locating}>
            {locating ? "Capturing location..." : "Capture current location"}
          </Button>
          {locationMessage ? (
            <div className="mt-3">
              <StatusNote tone={locationTone}>{locationMessage}</StatusNote>
            </div>
          ) : null}
          {mapsUrl && isAcceptableAccuracy(draft.accuracy ?? 0) ? (
            <a className="mt-3 flex min-h-12 items-center font-semibold text-action" href={mapsUrl} target="_blank" rel="noreferrer">
              View on map
            </a>
          ) : null}
        </Field>
        {duplicate ? (
          <div className="rounded-2xl border border-line bg-white p-4">
            <p className="text-[15px] leading-6">This mobile number already belongs to an existing shop.</p>
            <p className="mt-1 font-semibold">{duplicate.shopName}</p>
            <div className="mt-3 grid gap-2">
              {duplicate.id ? <Button onClick={() => navigate(`/shop/${duplicate.id}`)}>View existing shop</Button> : null}
              <Button variant="secondary" onClick={() => setDuplicate(null)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
        {saveError ? <p className="text-[15px] text-bad">{saveError}</p> : null}
      </div>
    </Screen>
  );
}

function savedLocationNote(saved: ShopDraft) {
  if (saved.latitude == null || saved.accuracy == null) {
    return { tone: "neutral" as const, message: "" };
  }
  if (isAcceptableAccuracy(saved.accuracy)) {
    return {
      tone: "good" as const,
      message: `Location captured. Accuracy: ${Math.round(saved.accuracy)} meters`,
    };
  }
  return {
    tone: "warn" as const,
    message: "GPS accuracy is low. Please move to an open area and try again.",
  };
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-line py-3">
      <p className="text-[13px] text-muted">{label}</p>
      <p className="mt-1 text-[16px]">{value}</p>
    </div>
  );
}

function PhotoBox({
  preview,
  onPick,
  onRemove,
}: {
  preview: string | null;
  onPick: (file: File | undefined) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          onPick(file);
        }}
      />
      {preview ? (
        <div>
          <img src={preview} alt="Shop preview" className="aspect-[4/3] w-full rounded-2xl object-cover" />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => inputRef.current?.click()}>
              Retake
            </Button>
            <Button variant="secondary" onClick={onRemove}>
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="secondary" onClick={() => inputRef.current?.click()}>
          Take shop photo
        </Button>
      )}
    </div>
  );
}

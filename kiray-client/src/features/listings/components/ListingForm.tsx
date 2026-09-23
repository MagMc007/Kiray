'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createListingSchema,
  updateListingSchema,
  validateListingImages,
  IMAGE_CONSTRAINTS,
  PROPERTY_TYPES,
  AMENITIES_LIST,
  type CreateListingFormData,
  type ListingImageFile,
} from '@/lib/validation/listingSchema';
import {
  useCreateListingMutation,
  useUpdateListingMutation,
  useUploadListingImagesMutation,
  useDeleteListingImageMutation,
} from '@/features/listings/listingsApi';
import type { Listing, PropertyType, Amenity } from '@/types/listing';
import { ADDIS_NEIGHBORHOODS, AMENITY_LABELS, MAP_DEFAULTS } from '@/lib/constants';
import { MapboxView } from '@/features/map/components/MapboxView';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Trash2,
  MapPin,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Check,
  Building,
  Home,
  Image as ImageIcon,
} from 'lucide-react';
import Link from 'next/link';

export interface ListingFormProps {
  initialListing?: Listing;
  mode?: 'create' | 'edit';
  onSubmitSuccess?: (listing: Listing) => void;
  onCancel?: () => void;
}

export const ListingForm: React.FC<ListingFormProps> = ({
  initialListing,
  mode = 'create',
  onSubmitSuccess,
  onCancel,
}) => {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // RTK Query Mutations
  const [createListing, { isLoading: isCreating }] = useCreateListingMutation();
  const [updateListing, { isLoading: isUpdating }] = useUpdateListingMutation();
  const [uploadListingImages, { isLoading: isUploadingImages }] = useUploadListingImagesMutation();
  const [deleteListingImage, { isLoading: isDeletingImage }] = useDeleteListingImageMutation();

  // Images state
  const initialImages: ListingImageFile[] = (initialListing?.images || []).map((img, idx) => ({
    url: img.url,
    publicId: img.publicId,
    order: img.order ?? idx,
    originalName: img.originalName,
  }));

  const [images, setImages] = useState<ListingImageFile[]>(initialImages);
  const [imageError, setImageError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Cloudinary upload failure & recovery state
  const [createdListingId, setCreatedListingId] = useState<string | null>(null);
  const [cloudinaryUploadError, setCloudinaryUploadError] = useState<string | null>(null);

  // Map coordinates state
  const initialCoordinates: [number, number] = initialListing?.location?.coordinates &&
    initialListing.location.coordinates.length === 2
    ? [initialListing.location.coordinates[0], initialListing.location.coordinates[1]]
    : MAP_DEFAULTS.ADDIS_COORDINATES;

  const [coordinates, setCoordinates] = useState<[number, number]>(initialCoordinates);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Setup
  const isEdit = mode === 'edit' && !!initialListing;
  const currentSchema = isEdit ? updateListingSchema : createListingSchema;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<CreateListingFormData>({
    resolver: zodResolver(currentSchema as any),
    mode: 'onTouched',
    defaultValues: {
      title: initialListing?.title || '',
      description: initialListing?.description || '',
      propertyType: initialListing?.propertyType || 'apartment',
      bedrooms: initialListing?.bedrooms ?? 1,
      bathrooms: initialListing?.bathrooms ?? 1,
      area: initialListing?.area || 80,
      areaUnit: initialListing?.areaUnit || 'sqm',
      price: initialListing?.price || 20000,
      currency: initialListing?.currency || 'ETB',
      amenities: initialListing?.amenities || ['wifi', 'security', 'water_included'],
      address: {
        neighborhood: initialListing?.address?.neighborhood || 'Bole',
        street: initialListing?.address?.street || '',
        city: initialListing?.address?.city || 'Addis Ababa',
        postalCode: initialListing?.address?.postalCode || '1000',
      },
      location: {
        type: 'Point',
        coordinates: initialCoordinates,
      },
      status: initialListing?.status || 'open',
    },
  });

  const selectedAmenities = watch('amenities') || [];
  const selectedNeighborhood = watch('address.neighborhood') || 'Bole';

  // Toggle Amenity helper
  const handleToggleAmenity = (amenity: Amenity) => {
    setImageError(null);
    setFormError(null);
    if (selectedAmenities.includes(amenity)) {
      setValue(
        'amenities',
        selectedAmenities.filter((a) => a !== amenity),
        { shouldValidate: true }
      );
    } else {
      setValue('amenities', [...selectedAmenities, amenity], { shouldValidate: true });
    }
  };

  // Image addition helper with size and mime-type checks
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    setCloudinaryUploadError(null);
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (images.length + files.length > IMAGE_CONSTRAINTS.MAX_IMAGES) {
      setImageError(
        `You can only upload up to ${IMAGE_CONSTRAINTS.MAX_IMAGES} images (currently have ${images.length}).`
      );
      return;
    }

    const newImageFiles: ListingImageFile[] = [];
    for (const file of files) {
      if (file.size > IMAGE_CONSTRAINTS.MAX_FILE_SIZE_BYTES) {
        setImageError(`"${file.name}" exceeds the 5MB size limit.`);
        return;
      }
      if (
        !IMAGE_CONSTRAINTS.ALLOWED_MIME_TYPES.includes(
          file.type as (typeof IMAGE_CONSTRAINTS.ALLOWED_MIME_TYPES)[number]
        )
      ) {
        setImageError(`"${file.name}" is not a supported format. Please use JPEG, PNG, or WebP.`);
        return;
      }

      newImageFiles.push({
        file,
        url: URL.createObjectURL(file),
        originalName: file.name,
        order: images.length + newImageFiles.length,
      });
    }

    setImages((prev) => [...prev, ...newImageFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Image removal helper
  const handleRemoveImage = async (index: number) => {
    setImageError(null);
    const imgToRemove = images[index];

    // Enforce minimum 2 images rule if deleting would drop below 2
    if (images.length <= IMAGE_CONSTRAINTS.MIN_IMAGES) {
      setImageError(
        `A listing must maintain at least ${IMAGE_CONSTRAINTS.MIN_IMAGES} photos. Upload replacement photos before removing this one.`
      );
      return;
    }

    // If it's already uploaded to Cloudinary on backend in edit mode
    if (isEdit && imgToRemove.publicId && initialListing?._id) {
      try {
        await deleteListingImage({
          id: initialListing._id,
          publicId: imgToRemove.publicId,
        }).unwrap();
      } catch (err: any) {
        setImageError(err?.data?.error || err?.message || 'Failed to remove image from Cloudinary.');
        return;
      }
    }

    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Retry Cloudinary upload if initial creation succeeded but image upload failed
  const handleRetryImageUpload = async () => {
    const targetListingId = createdListingId || initialListing?._id;
    if (!targetListingId) return;

    setCloudinaryUploadError(null);
    const filesToUpload = images.map((img) => img.file).filter((f): f is File => f instanceof File);

    if (!filesToUpload.length) {
      // Nothing new to upload
      router.push('/dashboard/landlord');
      return;
    }

    try {
      await uploadListingImages({
        id: targetListingId,
        images: filesToUpload,
      }).unwrap();

      router.push('/dashboard/landlord');
    } catch (err: any) {
      setCloudinaryUploadError(
        err?.data?.error || err?.message || 'Cloudinary upload failed. Please try again.'
      );
    }
  };

  // Step Navigation Validation
  const handleNextStep = async () => {
    setImageError(null);
    setFormError(null);

    if (step === 1) {
      const isStep1Valid = await trigger([
        'title',
        'propertyType',
        'area',
        'areaUnit',
        'bedrooms',
        'bathrooms',
        'description',
      ]);
      if (!isStep1Valid) return;
    } else if (step === 2) {
      const isStep2Valid = await trigger([
        'address.neighborhood',
        'address.street',
        'address.city',
        'address.postalCode',
      ]);
      if (!isStep2Valid) return;
    } else if (step === 3) {
      const validation = validateListingImages(
        images.map((img) => (img.file ? img.file : { url: img.url }))
      );
      if (!validation.valid) {
        setImageError(validation.errors[0]);
        return;
      }
    }

    setStep((prev) => Math.min(prev + 1, 4));
  };

  // Form error callback: jumps to invalid step if user submits with errors
  const onFormError = (formErrors: any) => {
    const errorKeys = Object.keys(formErrors || {});
    if (!errorKeys.length) return;

    const step1Fields = ['title', 'propertyType', 'area', 'areaUnit', 'bedrooms', 'bathrooms', 'description'];
    const step2Fields = ['address', 'location'];
    const step4Fields = ['price', 'amenities'];

    if (errorKeys.some((k) => step1Fields.includes(k))) {
      setStep(1);
      setFormError('Please fill in all required property details.');
    } else if (errorKeys.some((k) => step2Fields.includes(k))) {
      setStep(2);
      setFormError('Please fill in all required address fields.');
    } else if (errorKeys.some((k) => step4Fields.includes(k))) {
      setStep(4);
      setFormError('Please provide a valid rent price and select at least one amenity.');
    } else {
      setFormError('Please resolve the highlighted errors before publishing.');
    }
  };

  // Final Form Submission — only ever called by the explicit Publish button click
  const onFormSubmit = async (data: CreateListingFormData) => {
    setImageError(null);
    setFormError(null);
    setCloudinaryUploadError(null);

    // Validate images count (minimum 2, maximum 6)
    const validation = validateListingImages(
      images.map((img) => (img.file ? img.file : { url: img.url }))
    );
    if (!validation.valid) {
      setStep(3);
      setImageError(validation.errors[0]);
      return;
    }

    // Ensure coordinates are synchronized
    data.location = {
      type: 'Point',
      coordinates,
    };

    if (isEdit && initialListing) {
      try {
        const updated = await updateListing({
          id: initialListing._id,
          data,
        }).unwrap();

        // Upload any newly selected local files to Cloudinary
        const newFiles = images.map((img) => img.file).filter((f): f is File => f instanceof File);
        if (newFiles.length > 0) {
          await uploadListingImages({
            id: initialListing._id,
            images: newFiles,
          }).unwrap();
        }

        onSubmitSuccess?.(updated);
        router.push('/dashboard/landlord');
      } catch (err: any) {
        setImageError(err?.data?.error || err?.message || 'Failed to update listing.');
      }
    } else {
      // Create mode
      try {
        const created = await createListing(data).unwrap();
        setCreatedListingId(created._id);

        // Upload image files to Cloudinary via server endpoint
        const newFiles = images.map((img) => img.file).filter((f): f is File => f instanceof File);
        if (newFiles.length > 0) {
          try {
            await uploadListingImages({
              id: created._id,
              images: newFiles,
            }).unwrap();
          } catch (uploadErr: any) {
            setCloudinaryUploadError(
              uploadErr?.data?.error ||
                uploadErr?.message ||
                'Listing created, but photo upload to Cloudinary failed. You can retry below.'
            );
            return;
          }
        }

        onSubmitSuccess?.(created);
        router.push('/dashboard/landlord');
      } catch (err: any) {
        setImageError(err?.data?.error || err?.message || 'Failed to create listing.');
      }
    }
  };

  const isSubmitting = isCreating || isUpdating || isUploadingImages || isDeletingImage;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden text-slate-800">
      {/* Form Header */}
      <div className="p-6 sm:p-8 bg-stone-50/80 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-orange-100 text-orange-600 rounded-xl">
              <Building className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
              {isEdit ? 'Edit Rental Listing' : 'Publish New Rental Listing'}
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Zero broker fees • Direct tenant inquiries • Cloudinary-optimized photos
          </p>
        </div>

        <Link
          href="/dashboard/landlord"
          onClick={(e) => {
            if (onCancel) {
              e.preventDefault();
              onCancel();
            }
          }}
          className="text-xs font-semibold text-stone-500 hover:text-stone-800 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition"
        >
          Cancel
        </Link>
      </div>

      {/* Step Progress Pills */}
      <div className="px-6 sm:px-8 py-3 bg-orange-50/50 border-b border-orange-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          {[
            { num: 1, label: 'Basics' },
            { num: 2, label: 'Location & Map' },
            { num: 3, label: 'Photos (Min 2)' },
            { num: 4, label: 'Price & Features' },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => {
                if (s.num < step) setStep(s.num);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition ${
                step === s.num
                  ? 'bg-orange-600 text-white shadow-xs'
                  : step > s.num
                  ? 'bg-emerald-100 text-emerald-800 cursor-pointer'
                  : 'bg-stone-100 text-stone-400'
              }`}
            >
              <span>{s.num}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>
        <span className="text-stone-500 font-medium">Step {step} of 4</span>
      </div>

      {/* Cloudinary Upload Failure Banner */}
      {cloudinaryUploadError && (
        <div className="m-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-amber-900">
                Photo Upload to Cloudinary Interrupted
              </h4>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                {cloudinaryUploadError}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleRetryImageUpload}
              disabled={isUploadingImages}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isUploadingImages ? 'Retrying...' : 'Retry Photo Upload'}</span>
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard/landlord')}
              className="px-4 py-2 bg-white text-stone-700 hover:bg-stone-100 text-xs font-semibold rounded-xl border border-stone-300 transition"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* General Form Error Alert */}
      {(imageError || formError) && (
        <div className="mx-6 mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{imageError || formError}</span>
        </div>
      )}

      {/* Form Content */}
      {/* NOTE: No onSubmit here — form submission is handled exclusively via the
           explicit "Publish" button onClick below, preventing any accidental
           submission (e.g. Enter key, button replacement race conditions). */}
      <form className="p-6 sm:p-8 space-y-6">
        {/* STEP 1: BASICS */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Listing Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Modern 2-Bedroom Sunlit Flat in Bole Medhanialem"
                {...register('title')}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition"
              />
              {errors.title && (
                <p className="text-xs text-rose-600 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Property Type *
                </label>
                <select
                  {...register('propertyType')}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm capitalize outline-none focus:border-orange-500 transition"
                >
                  {PROPERTY_TYPES.map((pt) => (
                    <option key={pt} value={pt}>
                      {pt.charAt(0).toUpperCase() + pt.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.propertyType && (
                  <p className="text-xs text-rose-600 mt-1">{errors.propertyType.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Floor Area &amp; Unit *
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    {...register('area', { valueAsNumber: true })}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 text-sm outline-none focus:border-orange-500 transition"
                  />
                  <select
                    {...register('areaUnit')}
                    className="px-3 py-2.5 rounded-xl border border-stone-300 text-sm outline-none"
                  >
                    <option value="sqm">sqm</option>
                    <option value="sqft">sqft</option>
                  </select>
                </div>
                {errors.area && (
                  <p className="text-xs text-rose-600 mt-1">{errors.area.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Bedrooms *
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  {...register('bedrooms', { valueAsNumber: true })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm outline-none focus:border-orange-500 transition"
                />
                {errors.bedrooms && (
                  <p className="text-xs text-rose-600 mt-1">{errors.bedrooms.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Bathrooms *
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  {...register('bathrooms', { valueAsNumber: true })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm outline-none focus:border-orange-500 transition"
                />
                {errors.bathrooms && (
                  <p className="text-xs text-rose-600 mt-1">{errors.bathrooms.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Property Description *
              </label>
              <textarea
                rows={4}
                placeholder="Describe features: power backup generator, private water reservoir, 24/7 security guard, nearby transport routes, kitchen appliances..."
                {...register('description')}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm outline-none focus:border-orange-500 transition"
              />
              {errors.description && (
                <p className="text-xs text-rose-600 mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: LOCATION & MAPBOX PIN */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Neighborhood (Addis Ababa) *
                </label>
                <select
                  {...register('address.neighborhood')}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm outline-none focus:border-orange-500 transition"
                >
                  {ADDIS_NEIGHBORHOODS.filter((n) => n !== 'All Neighborhoods').map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Street / Landmark Address *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near Edna Mall, Cameroon Street"
                  {...register('address.street')}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm outline-none focus:border-orange-500 transition"
                />
                {errors.address?.street && (
                  <p className="text-xs text-rose-600 mt-1">{errors.address.street.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Addis Ababa"
                  {...register('address.city')}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm outline-none focus:border-orange-500 transition"
                />
                {errors.address?.city && (
                  <p className="text-xs text-rose-600 mt-1">{errors.address.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1000"
                  {...register('address.postalCode')}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm outline-none focus:border-orange-500 transition"
                />
                {errors.address?.postalCode && (
                  <p className="text-xs text-rose-600 mt-1">{errors.address.postalCode.message}</p>
                )}
              </div>
            </div>

            {/* Interactive Mapbox Picker */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-orange-600" />
                  Mapbox Pinpoint: Click map to position property pin
                </span>
                <span className="text-[11px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                  Coordinates: [{coordinates[0].toFixed(4)}, {coordinates[1].toFixed(4)}]
                </span>
              </div>

              <div className="rounded-2xl overflow-hidden border border-stone-300 shadow-xs h-64 sm:h-80">
                <MapboxView
                  interactivePicker={true}
                  centerCoordinates={coordinates}
                  onCoordinatesChange={(newCoords) => {
                    setCoordinates(newCoords);
                    setValue('location.coordinates', newCoords);
                  }}
                  height="h-full"
                  showCardOverlay={false}
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                Tip: Precise Mapbox pins help rentees discover your home on the map view and reach out without broker fees.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: CLOUDINARY PHOTOS (ENFORCING MIN 2, MAX 6) */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-orange-50/60 rounded-2xl border border-orange-200">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Property Photos ({images.length}/{IMAGE_CONSTRAINTS.MAX_IMAGES})
                  </h3>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                      images.length >= IMAGE_CONSTRAINTS.MIN_IMAGES
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {images.length >= IMAGE_CONSTRAINTS.MIN_IMAGES
                      ? '✓ Minimum met'
                      : `Minimum ${IMAGE_CONSTRAINTS.MIN_IMAGES} required`}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Stored &amp; accelerated via Cloudinary CDN • Max 5MB per photo • Formats: JPG, PNG, WebP
                </p>
              </div>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={images.length >= IMAGE_CONSTRAINTS.MAX_IMAGES || isSubmitting}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Add Photos</span>
                </button>
              </div>
            </div>

            {/* Photo Grid Preview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img, idx) => (
                <div
                  key={img.publicId || img.url || idx}
                  className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 shadow-2xs group"
                >
                  <img
                    src={img.url}
                    alt={img.originalName || `Property photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold rounded-md">
                    {idx === 0 ? 'Cover Photo' : `#${idx + 1}`}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    disabled={isSubmitting}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-rose-600 hover:bg-rose-600 hover:text-white transition shadow-sm"
                    title="Remove photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {images.length < IMAGE_CONSTRAINTS.MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-300 hover:border-orange-500 rounded-2xl aspect-[4/3] flex flex-col items-center justify-center text-stone-400 hover:text-orange-600 transition bg-stone-50/50 cursor-pointer"
                >
                  <ImageIcon className="w-6 h-6 mb-1" />
                  <span className="text-xs font-bold">+ Upload Photos</span>
                  <span className="text-[10px] text-stone-400">
                    {IMAGE_CONSTRAINTS.MAX_IMAGES - images.length} slots remaining
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: PRICE & AMENITIES */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Rent Pricing Card */}
            <div className="p-5 rounded-2xl bg-orange-50/70 border border-orange-200 space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Monthly Rent (ETB) *
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-500">
                    ETB
                  </span>
                  <input
                    type="number"
                    step="500"
                    min="0"
                    {...register('price', { valueAsNumber: true })}
                    className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-stone-300 text-lg font-bold text-orange-600 bg-white outline-none focus:border-orange-500 transition"
                  />
                </div>
                <span className="text-xs text-stone-500 font-medium">per month</span>
              </div>
              {errors.price && (
                <p className="text-xs text-rose-600 mt-1">{errors.price.message}</p>
              )}
              <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                <Check className="w-3.5 h-3.5" />
                <span>100% of this rent goes directly to you. No commission taken by Kiray or brokers.</span>
              </p>
            </div>

            {/* Amenities Selection Chips */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Included Amenities &amp; Services * (Select at least 1)
              </label>
              {errors.amenities && (
                <p className="text-xs text-rose-600 mb-2">{errors.amenities.message}</p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {AMENITIES_LIST.map((amenityKey) => {
                  const isSelected = selectedAmenities.includes(amenityKey);
                  return (
                    <button
                      key={amenityKey}
                      type="button"
                      onClick={() => handleToggleAmenity(amenityKey)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center gap-2 transition ${
                        isSelected
                          ? 'bg-orange-50 border-orange-400 text-orange-800 shadow-2xs'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 ${
                          isSelected ? 'text-orange-600' : 'text-stone-300'
                        }`}
                      />
                      <span className="truncate">{AMENITY_LABELS[amenityKey]?.label || amenityKey}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="pt-6 border-t border-stone-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-stone-300 rounded-xl hover:bg-stone-100 flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-2.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl flex items-center gap-1.5 shadow-sm transition"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(onFormSubmit, onFormError)()}
              className="px-7 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 rounded-xl flex items-center gap-1.5 shadow-md transition transform active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? isUploadingImages
                    ? 'Uploading to Cloudinary...'
                    : 'Saving...'
                  : isEdit
                  ? 'Update Listing'
                  : 'Publish Rental Listing'}
              </span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

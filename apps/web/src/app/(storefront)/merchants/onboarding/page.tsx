'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Loader2, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { merchantOnboardingSchema, MerchantOnboardingData, ONBOARDING_STEPS } from './types';
import { OnboardingStepBusiness } from './components/OnboardingStepBusiness';
import { OnboardingStepIdentity } from './components/OnboardingStepIdentity';
import { OnboardingStepLocation } from './components/OnboardingStepLocation';
import { OnboardingStepProducts } from './components/OnboardingStepProducts';
import { OnboardingStepCertifications } from './components/OnboardingStepCertifications';
import { OnboardingSuccess } from './components/OnboardingSuccess';
import { API_MODE, ApiError, fetchApi } from '@/lib/api';
import { useAuthStore } from '@/features/auth/store';

function MerchantOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const isEditingApplication = searchParams.get('edit') === 'true' && user?.userType === 'Merchant';
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const [cacUploaded, setCacUploaded] = useState(false);
  const [idUploaded, setIdUploaded] = useState(false);
  const [certUploaded, setCertUploaded] = useState(false);
  const [photosCount, setPhotosCount] = useState(0);
  const [cacDocument, setCacDocument] = useState<File | null>(null);
  const [identityDocument, setIdentityDocument] = useState<File | null>(null);
  const [certificationDocument, setCertificationDocument] = useState<File | null>(null);
  const [samplePhotos, setSamplePhotos] = useState<File[]>([]);

  const form = useForm<MerchantOnboardingData>({
    resolver: zodResolver(merchantOnboardingSchema),
    mode: 'onTouched',
    defaultValues: {
      businessName: '',
      businessType: '',
      isProvisional: false,
      rcNumber: '',
      ownerName: '',
      phone: '',
      email: '',
      idType: '',
      ninNumber: '',
      address: '',
      marketCluster: '',
      city: '',
      state: '',
      bankName: '',
      accountNumber: '',
      productDescription: '',
      capacity: '',
      samplePhotosCount: 0,
      certificationType: '',
      confirmSupplyCapacity: false,
      agreeToFulfillmentSla: false,
    },
  });

  useEffect(() => {
    if (!isEditingApplication || API_MODE === 'mock') return;
    void fetchApi<any>('/api/v1/merchant-onboarding/applications/me').then((application) => {
      form.reset({
        businessName: application.business_name, businessType: application.business_type, isProvisional: application.is_provisional,
        rcNumber: application.rc_number ?? '', ownerName: application.owner_name, phone: application.phone, email: application.email,
        idType: application.id_type, ninNumber: application.nin_number, address: application.address, marketCluster: application.market_cluster,
        city: application.city, state: application.state, bankName: application.bank_name, accountNumber: application.account_number,
        productDescription: application.product_description, capacity: application.capacity, samplePhotosCount: application.sample_photos_count,
        certificationType: application.certification_type, certificationNumber: application.certification_number ?? '',
        confirmSupplyCapacity: application.confirm_supply_capacity, agreeToFulfillmentSla: application.agree_to_fulfillment_sla,
      });
      setPhotosCount(application.sample_photos_count);
    }).catch((error) => setSubmissionError(error instanceof Error ? error.message : 'Unable to load your application.'));
  }, [form, isEditingApplication]);

  const onSubmit = async (values: MerchantOnboardingData) => {
    setIsSubmitting(true);
    setSubmissionError(null);
    try {
      if (API_MODE !== 'mock') {
        const payload = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (value !== undefined && value !== null) payload.append(key, String(value));
        });
        if (cacDocument) payload.append('cacDocument', cacDocument);
        if (identityDocument) payload.append('identityDocument', identityDocument);
        if (certificationDocument) payload.append('certificationDocument', certificationDocument);
        samplePhotos.forEach((photo) => payload.append('samplePhotos', photo));
        await fetchApi(isEditingApplication ? '/api/v1/merchant-onboarding/applications/me' : '/api/v1/merchant-onboarding/applications', {
          method: isEditingApplication ? 'PATCH' : 'POST',
          body: payload,
        });
      }
      setIsSuccess(true);
    } catch (error) {
      setSubmissionError(
        error instanceof ApiError
          ? error.message
          : 'Unable to submit your application. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    let fields: (keyof MerchantOnboardingData)[] = [];
    if (currentStep === 0) fields = ['businessName', 'businessType'];
    if (currentStep === 1) fields = ['ownerName', 'phone', 'email', 'idType', 'ninNumber'];
    if (currentStep === 2) fields = ['address', 'marketCluster', 'city', 'state', 'bankName', 'accountNumber'];
    if (currentStep === 3) fields = ['productDescription', 'capacity', 'samplePhotosCount'];
    if (currentStep === 4) fields = ['certificationType', 'confirmSupplyCapacity', 'agreeToFulfillmentSla'];

    const valid = await form.trigger(fields);
    if (valid) {
      if (currentStep < ONBOARDING_STEPS.length - 1) {
        setCurrentStep((s) => s + 1);
      } else {
        form.handleSubmit(onSubmit)();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handlePhotosSelected = (photos: File[]) => {
    setSamplePhotos(photos);
    setPhotosCount(photos.length);
    form.setValue('samplePhotosCount', photos.length, { shouldValidate: true });
  };

  if (isSuccess) {
    if (isEditingApplication) {
      return <div className="mx-auto mt-28 max-w-lg rounded-xl border border-success-border bg-success-bg p-8 text-center"><h1 className="text-xl font-bold text-success-dark">Application updated</h1><p className="mt-2 text-sm text-text-muted">Your details have been submitted for review.</p><Button className="mt-6" onClick={() => router.push('/erp/onboarding')}>Back to application status</Button></div>;
    }
    return <OnboardingSuccess isProvisional={form.getValues('isProvisional')} />;
  }

  const activeStepMeta = ONBOARDING_STEPS[currentStep];

  return (
    <div className="min-h-screen bg-surface-1 py-12 mt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 mb-3">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-text tracking-tight">{isEditingApplication ? 'Update Merchant Application' : 'Merchant Verification'}</h1>
          <p className="text-xs text-text-muted mt-1 max-w-md mx-auto">
            Complete the 5-step verification process to become an approved seller on BuyNaija.
          </p>
        </div>

        {/* Linear Progress Indicator */}
        <div className="mb-6 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-brand-700">Step {currentStep + 1} of 5</span>
            <span className="text-text-muted font-medium">{activeStepMeta.title}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-border overflow-hidden">
            <div
              className="h-full bg-brand-600 transition-all duration-300 rounded-full"
              style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Wizard Card */}
        <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
          <div className="mb-6 pb-4 border-b border-border">
            <h2 className="text-xl font-bold text-text">{activeStepMeta.title}</h2>
            <p className="text-xs text-text-muted mt-0.5">{activeStepMeta.description}</p>
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            {currentStep === 0 && (
              <OnboardingStepBusiness
                form={form}
                cacUploaded={cacUploaded}
                onUploadCac={(file) => { setCacDocument(file); setCacUploaded(true); }}
                onRemoveCac={() => { setCacDocument(null); setCacUploaded(false); }}
              />
            )}
            {currentStep === 1 && (
              <OnboardingStepIdentity
                form={form}
                idUploaded={idUploaded}
                onUploadId={(file) => { setIdentityDocument(file); setIdUploaded(true); }}
                onRemoveId={() => { setIdentityDocument(null); setIdUploaded(false); }}
              />
            )}
            {currentStep === 2 && (
              <OnboardingStepLocation form={form} />
            )}
            {currentStep === 3 && (
              <OnboardingStepProducts
                form={form}
                photosCount={photosCount}
                onPhotosSelected={handlePhotosSelected}
                selectedPhotos={samplePhotos}
              />
            )}
            {currentStep === 4 && (
              <OnboardingStepCertifications
                form={form}
                certUploaded={certUploaded}
                onUploadCert={(file) => { setCertificationDocument(file); setCertUploaded(true); }}
                onRemoveCert={() => { setCertificationDocument(null); setCertUploaded(false); }}
              />
            )}

            {submissionError && (
              <p role="alert" className="mt-5 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
                {submissionError}
              </p>
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              {currentStep > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="rounded-xl px-5"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                </Button>
              ) : (
                <div />
              )}

              <Button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="font-bold rounded-xl px-7"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                  </>
                ) : currentStep === ONBOARDING_STEPS.length - 1 ? (
                  'Submit for Verification'
                ) : (
                  <>
                    Continue <ArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function MerchantOnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-1 py-12" />}>
      <MerchantOnboardingContent />
    </Suspense>
  );
}

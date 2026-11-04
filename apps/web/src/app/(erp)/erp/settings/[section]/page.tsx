
import { SettingsLayout } from '@/features/settings/components/SettingsLayout';
import { SettingsForm } from '@/features/settings/components/SettingsForm';
export default async function SettingsSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  return <SettingsLayout><SettingsForm section={section} /></SettingsLayout>;
}

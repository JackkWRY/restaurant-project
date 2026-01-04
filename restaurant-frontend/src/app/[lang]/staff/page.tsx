import { getDictionary } from "@/locales/dictionary";
import StaffDashboard from "@/components/staff/StaffDashboard";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function StaffPage({ params }: Props) {
  const { lang } = await params;

  const dict = await getDictionary(lang);

  return <StaffDashboard dict={dict} lang={lang} />;
}

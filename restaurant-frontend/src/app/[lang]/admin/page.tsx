import { getDictionary } from "@/locales/dictionary";
import AdminDashboard from "@/components/AdminDashboard";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function AdminPage({ params }: Props) {
  const { lang } = await params;

  const dict = await getDictionary(lang);

  return <AdminDashboard dict={dict} lang={lang} />;
}
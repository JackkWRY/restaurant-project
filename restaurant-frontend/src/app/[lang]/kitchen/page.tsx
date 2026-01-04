import { getDictionary } from "@/locales/dictionary";
import KitchenDashboard from "@/components/kitchen/KitchenDashboard";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function KitchenPage({ params }: Props) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <KitchenDashboard dict={dict} lang={lang} />;
}
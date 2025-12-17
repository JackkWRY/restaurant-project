import { getDictionary } from "@/locales/dictionary";
import LoginForm from "@/components/LoginForm";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function LoginPage({ params }: Props) {
  const { lang } = await params;

  const dict = await getDictionary(lang);

  return <LoginForm dict={dict} lang={lang} />;
}
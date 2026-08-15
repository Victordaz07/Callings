import { auth } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { loadSecretario } from "./data-actions";
import { SecretarioApp } from "./SecretarioApp";

export default async function SecretarioPage() {
  const session = await auth();
  const userId = session!.user!.email!;
  const [settings, data] = await Promise.all([getSettings(userId), loadSecretario()]);

  return <SecretarioApp initialData={data} roles={settings.roles} />;
}

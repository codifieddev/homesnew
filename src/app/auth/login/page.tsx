import LoginForm from "./LoginForm";

function firstQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildBotChallenge(seed: string) {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return {
    num1: (hash % 10) + 1,
    num2: ((hash >>> 5) % 10) + 1,
  };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    callbackUrl?: string | string[];
    error?: string | string[];
  }>;
}) {
  const query = await searchParams;

  const callbackUrl = firstQueryValue(query.callbackUrl) || "/admin";
  const urlError = firstQueryValue(query.error) ?? null;
  const botChallenge = buildBotChallenge(`${callbackUrl}|${urlError ?? ""}`);

  return (
    <LoginForm
      callbackUrl={callbackUrl}
      urlError={urlError}
      botChallenge={botChallenge}
      currentYear={new Date().getFullYear()}
    />
  );
}

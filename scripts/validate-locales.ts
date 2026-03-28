import { getLocaleDiagnostics } from "@/lib/i18n/validation";

async function main() {
  const diagnostics = await getLocaleDiagnostics();

  const failures = diagnostics.flatMap((locale) =>
    locale.namespaces.flatMap((namespace) => {
      const issues = [];

      if (namespace.missingKeys.length) {
        issues.push(
          `${locale.locale}/${namespace.namespace}: missing ${namespace.missingKeys.join(", ")}`
        );
      }

      if (namespace.extraKeys.length) {
        issues.push(
          `${locale.locale}/${namespace.namespace}: extra ${namespace.extraKeys.join(", ")}`
        );
      }

      return issues;
    })
  );

  if (failures.length > 0) {
    console.error("Locale validation failed:");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log("Locale validation passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

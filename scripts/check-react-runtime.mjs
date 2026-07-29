import { readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, parse, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");
const webPackageFile = join(projectRoot, "apps", "web", "package.json");
const webRequire = createRequire(pathToFileURL(webPackageFile));

function findPackage(entryFile, expectedName) {
  let currentDirectory = dirname(realpathSync(entryFile));
  const root = parse(currentDirectory).root;

  while (currentDirectory !== root) {
    const packageFile = join(currentDirectory, "package.json");

    try {
      const metadata = JSON.parse(readFileSync(packageFile, "utf8"));
      if (metadata.name === expectedName) {
        return {
          name: metadata.name,
          version: metadata.version,
          directory: realpathSync(currentDirectory),
          packageFile: realpathSync(packageFile)
        };
      }
    }
    catch {
      // Continua subindo até encontrar o package.json correto.
    }

    currentDirectory = dirname(currentDirectory);
  }

  throw new Error(`Não foi possível localizar package.json de ${expectedName}.`);
}

function resolvePackage(requireFrom, packageName) {
  return findPackage(requireFrom.resolve(packageName), packageName);
}

function createPackageRequire(packageInfo) {
  return createRequire(pathToFileURL(packageInfo.packageFile));
}

function resolveReactFrom(label, requireFrom) {
  const react = resolvePackage(requireFrom, "react");
  return { label, ...react };
}

try {
  const webReact = resolvePackage(webRequire, "react");
  const webReactDom = resolvePackage(webRequire, "react-dom");
  const webRouterDom = resolvePackage(webRequire, "react-router-dom");

  const reactResolutions = [
    { label: "aplicação web", ...webReact },
    resolveReactFrom("react-dom", createPackageRequire(webReactDom)),
    resolveReactFrom("react-router-dom", createPackageRequire(webRouterDom))
  ];

  const uniqueReactDirectories = new Set(
    reactResolutions.map((item) => item.directory.toLowerCase())
  );
  const uniqueReactVersions = new Set(
    reactResolutions.map((item) => item.version)
  );

  console.log(`React: ${webReact.version}`);
  console.log(`React DOM: ${webReactDom.version}`);
  console.log("Resoluções de React:");

  for (const item of reactResolutions) {
    console.log(`- ${item.label}: ${item.version} em ${item.directory}`);
  }

  if (uniqueReactDirectories.size !== 1) {
    throw new Error("Foram encontradas cópias físicas diferentes do React.");
  }

  if (uniqueReactVersions.size !== 1) {
    throw new Error("Foram encontradas versões diferentes do React.");
  }

  if (webReact.version !== webReactDom.version) {
    throw new Error("React e React DOM estão em versões diferentes.");
  }

  console.log("[doctor] Runtime React consistente e deduplicado.");
}
catch (error) {
  console.error(`[doctor] ${error.message}`);
  process.exitCode = 1;
}

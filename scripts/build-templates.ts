import execa from "execa"
import path from "path"
import pkgDir from "pkg-dir"

// configure paths
const rootPath = pkgDir.sync(__dirname)
const toolingPath = path.join(rootPath, "tooling")
const paths = {
  js: path.join(toolingPath, "cra-template"),
  ts: path.join(toolingPath, "cra-template-typescript"),
}

// output path is either the first input to the script (`/tmp` in `ts-node
// build-templates.ts /tmp`) or `rootPath` if no input provided
const outputPath = process.argv[2] || rootPath

buildTemplates()

async function buildTemplates() {
  return Promise.all(["js", "ts"].map(buildTemplate))
}

async function buildTemplate(type: "js" | "ts") {
  const templatePath = paths[type]
  const buildDir = `cra-template-${type}`
  const buildPath = path.join(outputPath, buildDir)

  try {
    console.log(`${type}: Generating project at ${buildPath}`)
    await execa(
      "yarn",
      ["create", "react-app", buildDir, "--template", `file:${templatePath}`],
      { cwd: outputPath },
    )

    console.log(`${type}: Building project`)
    await execa("yarn", ["build"], { cwd: buildPath })
  } catch (error) {
    // log the error message and then exit using the error from stderr
    console.error(`${type}: template failed to build`)
    console.error(error.message)
    process.exit(error.errno || 1)
  }
}

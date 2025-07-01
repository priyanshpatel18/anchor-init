#!/usr/bin/env node

const { Command } = require("commander");
const fs = require("fs-extra");
const path = require("path");
const { spawn } = require("child_process");
const handlebars = require("handlebars");
const web3 = require("@solana/web3.js");
const { snakeCase } = require("change-case");
const inquirer = require("inquirer").default;

const program = new Command();

handlebars.registerHelper("PascalCase", str =>
  str.replace(/(^\w|_\w)/g, s => s.replace('_', '').toUpperCase())
);

handlebars.registerHelper("camelCase", str => {
  const pascal = str.replace(/(^\w|_\w)/g, s => s.replace('_', '').toUpperCase());
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
});

program
  .name("anchor-init")
  .description("Create a custom Anchor program template")
  .argument("<project-name>", "Name of your Anchor program")
  .option("--all", "Run all setup steps automatically (build, install, deploy, test)")
  .option("--git", "Initialize a Git repository automatically")
  .helpOption("-h, --help", "Display help for command")
  .addHelpText("after", `
Examples:

  $ anchor-init my_program
  $ anchor-init my_program --all --git
`)
  .action(async (projectName, options) => {
    if (options.help || process.argv.includes('--help') || process.argv.includes('-h')) {
      return;
    }

    const originalName = projectName;
    projectName = snakeCase(projectName);
    if (projectName !== originalName) {
      console.log(`ℹ️  Converted project name to snake_case: ${projectName}`);
    }
    if (!/^[a-z][a-z0-9_]*$/.test(projectName)) {
      console.error('❌ Invalid project name. Must be snake_case, start with a letter, and contain only lowercase letters, numbers, and underscores.');
      process.exit(1);
    }

    const targetDir = path.join(process.cwd(), projectName);
    const templateDir = path.join(__dirname, "../templates");

    if (fs.existsSync(targetDir)) {
      console.error(`❌ Directory "${projectName}" already exists.`);
      process.exit(1);
    }

    const keypair = web3.Keypair.generate();
    const programId = keypair.publicKey.toBase58();

    console.log(`📁 Creating project: ${projectName}`);
    console.log(`🔐 Generated Program ID: ${programId}`);

    await copyTemplates(templateDir, targetDir, { projectName, programId });

    console.log(`✅ Templates copied successfully.`);

    console.log(`🔧 Running "anchor build"...`);
    try {
      await runCommand("anchor build", targetDir);
      console.log(`✅ anchor build completed.`);
    } catch (err) {
      console.error(`❌ anchor build failed:\n${err.message}`);
      process.exit(1);
    }

    await showNextSteps(projectName, options);
    let shouldInitGit = false;

    if (options.git) {
      shouldInitGit = true;
      console.log("🌀 --git flag detected. Initializing Git...");
    } else {
      const { initGit } = await inquirer.prompt([
        {
          type: "confirm",
          name: "initGit",
          message: "Initialize a Git repository?",
          default: true
        }
      ]);
      shouldInitGit = initGit;
    }

    if (shouldInitGit) {
      try {
        await runCommand("git init", targetDir);
        await runCommand("git add .", targetDir);
        await runCommand(`git commit -m "Initial commit for ${projectName}"`, targetDir);
        console.log("\n✅ Git repository initialized.");
      } catch (err) {
        console.error(`❌ Git initialization failed:\n${err.message}`);
      }
    }
  });

program.parse();

async function runCommand(command, cwd) {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(" ");

    const proc = spawn(cmd, args, {
      cwd,
      shell: true,
      stdio: ["inherit", "pipe", "pipe"],
    });

    let stderr = "";
    let stdout = "";

    proc.stdout.on("data", data => {
      process.stdout.write(data);
      stdout += data.toString();
    });

    proc.stderr.on("data", data => {
      process.stderr.write(data);
      stderr += data.toString();
    });

    proc.on("exit", code => {
      if (code !== 0) {
        const combined = stdout + stderr;

        // Fancy error pattern recognition
        if (combined.includes("Connection refused")) {
          console.error(`\n❌  Looks like the Solana test validator isn't running. Start it with:\n`);
          console.error(`   ⚙️  \x1b[36manchor test-validator\x1b[0m\n`);
          console.error(`   🧪 Then retry: \x1b[32myarn deploy:local\x1b[0m\n`);
        } else if (combined.includes("websocket error")) {
          console.error(`\n❌  WebSocket error detected.`);
          console.error(`   🧩 Are you sure the validator is running?\n`);
        } else if (combined.includes("No test files found")) {
          console.error(`\n❌  No test files found. Make sure you have files in \x1b[33mtests/**/*.ts\x1b[0m`);
        } else {
          console.error(`\n❌  Command "${command}" failed with exit code ${code}`);
        }

        reject(new Error(`Command "${command}" exited with code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

async function copyTemplates(src, dest, context) {
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);

    const rawName = entry.name.replace(".hbs", "");
    let compiledFileName = handlebars.compile(rawName)(context);

    if (compiledFileName === "gitignore") {
      compiledFileName = ".gitignore";
    }

    // Rename any filename containing "anchor_init" to match the projectName
    compiledFileName = compiledFileName.replace(/anchor_init/g, context.projectName);

    const destPath = path.join(dest, compiledFileName);

    if (entry.isDirectory()) {
      await fs.mkdirp(destPath);
      await copyTemplates(srcPath, destPath, context);
    } else if (entry.isFile()) {
      const content = await fs.readFile(srcPath, "utf8");

      if (entry.name.endsWith(".hbs")) {
        const template = handlebars.compile(content);
        const result = template(context);
        await fs.outputFile(destPath, result);
      } else {
        await fs.copy(srcPath, destPath);
      }
    }
  }
}

async function showNextSteps(projectName, options) {
  console.log(`\n🚀 Project created at ./${projectName}\n`);

  const allSteps = ["keys", "build", "install", "deploy", "test"];
  let runSteps = [];

  if (options.all) {
    runSteps = allSteps;
    console.log("⚙️  Running all steps (--all enabled)");
  } else {
    const response = await inquirer.prompt([
      {
        type: "checkbox",
        name: "runSteps",
        message: "Which steps would you like to run now?",
        choices: [
          { name: "🔑 anchor keys sync", value: "keys" },
          { name: "🔧 anchor build", value: "build" },
          { name: "📦 yarn install", value: "install" },
          { name: "🚀 yarn deploy:local", value: "deploy" },
          { name: "🧪 yarn test:local", value: "test" },
        ],
      },
    ]);
    runSteps = response.runSteps;
  }

  const cwd = path.join(process.cwd(), projectName);

  for (const step of runSteps) {
    try {
      switch (step) {
        case "keys":
          await runCommand("anchor keys sync", cwd);
          break;
        case "build":
          await runCommand("anchor build", cwd);
          break;
        case "install":
          await runCommand("yarn", cwd);
          break;
        case "deploy":
          await runCommand("yarn deploy:local", cwd);
          break;
        case "test":
          await runCommand("yarn test:local", cwd);
          break;
      }
    } catch (err) {
      console.error(`❌ Failed on step "${step}":\n${err.message}`);

      if (step === "deploy") {
        console.error(`\n🚫 Deployment failed. Skipping remaining steps like tests.`);
        break;
      }

      break;
    }
  }

  console.log(`\n🎉 You're all set (unless we bailed out early)!\n`);
}

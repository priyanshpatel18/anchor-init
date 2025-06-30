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
  .action(async (projectName) => {
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

    await showNextSteps(projectName);
    const { initGit } = await inquirer.prompt([
      {
        type: "confirm",
        name: "initGit",
        message: "Initialize a Git repository?",
        default: true
      }
    ]);

    if (initGit) {
      try {
        await runCommand("git init", targetDir);
        await runCommand("git add .", targetDir);
        await runCommand(`git commit -m "Initial commit for ${projectName}"`, targetDir);
        console.log("✅ Git repository initialized.");
      } catch (err) {
        console.error(`❌ Git initialization failed:\n${err.message}`);
      }
    }
  });

program.parse();

async function runCommand(command, cwd) {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(" ");
    const proc = spawn(cmd, args, { cwd, shell: true, stdio: "inherit" });

    proc.on("exit", code => {
      if (code !== 0) reject(new Error(`Command "${command}" exited with code ${code}`));
      else resolve();
    });
  });
}

async function copyTemplates(src, dest, context) {
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);

    const rawName = entry.name.replace(".hbs", "");
    let compiledFileName = handlebars.compile(rawName)(context);

    // Rename folder/file named "anchor_init" directly
    if (compiledFileName === "anchor_init") {
      compiledFileName = context.projectName;
    }

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

async function showNextSteps(projectName) {
  console.log(`\n🚀 Project created at ./${projectName}\n`);

  const { runSteps } = await inquirer.prompt([
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
      ]
    }
  ]);

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
    }
  }

  console.log(`\n🎉 You're all set!`);
}
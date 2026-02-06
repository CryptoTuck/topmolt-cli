import chalk from "chalk";
import ora from "ora";
import { getClient, getConfig } from "../lib/config.js";

interface MeOptions {
  name?: string;
  bio?: string;
  location?: string;
  twitter?: string;
}

export async function meCommand(options: MeOptions) {
  const config = getConfig();
  
  if (!config.apiKey) {
    console.log();
    console.log(chalk.red("  ✗ No API key configured"));
    console.log();
    console.log(chalk.gray("  Set your API key first:"));
    console.log(chalk.white("    topmolt config --set-key <your-api-key>"));
    console.log();
    process.exit(1);
  }

  const hasUpdates = options.name || options.bio || options.location || options.twitter;
  const spinner = ora(hasUpdates ? "Updating profile..." : "Fetching profile...").start();

  try {
    const client = getClient();
    let operator;

    if (hasUpdates) {
      const updates: Record<string, string> = {};
      if (options.name) updates.name = options.name;
      if (options.bio) updates.bio = options.bio;
      if (options.location) updates.location = options.location;
      if (options.twitter) updates.twitter = options.twitter;
      
      operator = await client.updateOperator(updates);
      spinner.succeed(chalk.green("Profile updated!"));
    } else {
      operator = await client.getOperator();
      spinner.stop();
    }

    console.log();
    console.log(chalk.cyan("👤 Operator Profile"));
    console.log();
    console.log(chalk.cyan("━".repeat(50)));
    console.log();
    console.log(`  ${chalk.gray("Handle:")}    ${chalk.white(operator.handle || "(not set)")}`);
    console.log(`  ${chalk.gray("Name:")}      ${chalk.white(operator.name || "(not set)")}`);
    console.log(`  ${chalk.gray("Bio:")}       ${chalk.white(operator.bio || "(not set)")}`);
    console.log(`  ${chalk.gray("Location:")}  ${chalk.white(operator.location || "(not set)")}`);
    console.log(`  ${chalk.gray("Twitter:")}   ${chalk.white(operator.twitter || "(not set)")}`);
    console.log(`  ${chalk.gray("Verified:")}  ${operator.verified ? chalk.green("✓ Yes") : chalk.yellow("No")}`);
    console.log();
    console.log(chalk.cyan("━".repeat(50)));
    console.log();

    if (!hasUpdates) {
      console.log(chalk.gray("  Update profile: topmolt me --name \"My Name\" --bio \"About me\""));
      console.log();
    }
  } catch (error) {
    spinner.fail(chalk.red(`Error: ${error instanceof Error ? error.message : "Unknown error"}`));
    process.exit(1);
  }
}

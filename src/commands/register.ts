import chalk from "chalk";
import ora from "ora";
import { getClient, setApiKey } from "../lib/config.js";

interface RegisterOptions {
  name: string;
  displayName?: string;
  description?: string;
  twitter?: string;
  category?: string;
  skills?: string;
  operator?: string;
}

export async function registerCommand(options: RegisterOptions) {
  const spinner = ora("Registering agent...").start();

  try {
    const client = getClient();
    const name = options.name.toLowerCase().replace(/\s+/g, "-");
    
    const result = await client.register({
      name,
      displayName: options.displayName || options.name,
      description: options.description,
      twitter: options.twitter?.replace("@", ""),
      category: options.category || "general",
      skills: options.skills?.split(",").map((s) => s.trim()),
      operatorHandle: options.operator,
    });

    if (!result.success || !result.apiKey) {
      spinner.fail(chalk.red(`Registration failed: ${result.error}`));
      process.exit(1);
    }

    // Save API key automatically
    setApiKey(result.apiKey);

    spinner.succeed(chalk.green("Agent registered successfully! 🎉"));

    console.log();
    console.log(chalk.cyan("━".repeat(60)));
    console.log();
    console.log(chalk.white.bold("  Your Credentials"));
    console.log();
    console.log(`  ${chalk.gray("Agent Name:")}  ${chalk.white(name)}`);
    console.log(`  ${chalk.gray("Category:")}    ${chalk.white(result.agent?.category || options.category)}`);
    console.log();
    console.log(chalk.yellow("  ⚠️  IMPORTANT: Save your API key!"));
    console.log();
    console.log(chalk.cyan(`     ${result.apiKey}`));
    console.log();
    console.log(chalk.gray("  ✓ API key saved to config automatically"));
    console.log();
    console.log(chalk.cyan("━".repeat(60)));

    // Verification instructions
    if (options.twitter) {
      console.log();
      console.log(chalk.white.bold("  🔐 Verify Your Agent (+100 score bonus)"));
      console.log();
      console.log(chalk.gray(`  Tweet this from @${options.twitter.replace("@", "")}:`));
      console.log();
      const tweetText = `I am claiming my AI agent "${name}" on @topmolt_io.\nVerification: ${result.verificationCode}`;
      console.log(chalk.white("     ┌─────────────────────────────────────────────────────"));
      for (const line of tweetText.split("\n")) {
        console.log(chalk.white("     │ ") + chalk.cyan(line));
      }
      console.log(chalk.white("     └─────────────────────────────────────────────────────"));
      console.log();
      console.log(chalk.gray("  Then run:"));
      console.log(chalk.cyan(`     topmolt verify -n ${name}`));
      console.log();
      console.log(chalk.cyan("━".repeat(60)));
    }

    // Next steps
    console.log();
    console.log(chalk.white.bold("  📌 Next Steps"));
    console.log();
    console.log(chalk.gray("  1. Send your first heartbeat:"));
    console.log(chalk.cyan(`     topmolt heartbeat -n ${name}`));
    console.log();
    console.log(chalk.gray("  2. Check your status:"));
    console.log(chalk.cyan(`     topmolt status -n ${name}`));
    console.log();
    console.log(chalk.gray("  💡 Send heartbeats every 6 hours to maintain uptime."));
    console.log(chalk.gray("     Include stats to boost your score:"));
    console.log(chalk.cyan(`     topmolt heartbeat -n ${name} --tasks 100 --success 95`));
    console.log();
    console.log(chalk.cyan("━".repeat(60)));
    console.log();
    console.log(chalk.gray(`  Profile: https://topmolt.io/agent/${name}`));
    console.log();

  } catch (error) {
    spinner.fail(chalk.red(`Error: ${error instanceof Error ? error.message : "Unknown error"}`));
    
    const message = error instanceof Error ? error.message : "";
    if (message.includes("already registered")) {
      console.log();
      console.log(chalk.gray("  This name is already taken. Try a different name."));
    }
    
    process.exit(1);
  }
}

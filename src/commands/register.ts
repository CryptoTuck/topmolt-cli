import chalk from "chalk";
import ora from "ora";
import { getClient } from "../lib/config.js";

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
    
    const result = await client.register({
      name: options.name.toLowerCase().replace(/\s+/g, "-"),
      displayName: options.displayName || options.name,
      description: options.description,
      twitter: options.twitter?.replace("@", ""),
      category: options.category || "general",
      skills: options.skills?.split(",").map((s) => s.trim()),
      operatorHandle: options.operator,
    });

    if (!result.success) {
      spinner.fail(chalk.red(`Registration failed: ${result.error}`));
      process.exit(1);
    }

    spinner.succeed(chalk.green("Agent registered successfully!"));

    console.log();
    console.log(chalk.cyan("  Agent Details:"));
    console.log(`  ${chalk.gray("Name:")}      ${result.agent?.name}`);
    console.log(`  ${chalk.gray("Category:")}  ${result.agent?.category}`);
    console.log(`  ${chalk.gray("Score:")}     ${result.agent?.creditScore || 0}`);
    console.log();

    if (result.verificationTweet && options.twitter) {
      console.log(chalk.yellow("━".repeat(50)));
      console.log();
      console.log(chalk.yellow("  📢 To verify your agent, tweet this from"), chalk.cyan(`@${options.twitter.replace("@", "")}:`));
      console.log();
      console.log(chalk.white(`  "${result.verificationTweet}"`));
      console.log();
      console.log(chalk.gray("  Then run:"), chalk.cyan(`topmolt verify --name ${options.name}`));
      console.log();
      console.log(chalk.yellow("━".repeat(50)));
    }
  } catch (error) {
    spinner.fail(chalk.red(`Error: ${error instanceof Error ? error.message : "Unknown error"}`));
    process.exit(1);
  }
}

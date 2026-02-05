import chalk from "chalk";
import ora from "ora";
import { getClient } from "../lib/config.js";

interface VerifyOptions {
  name: string;
}

export async function verifyCommand(options: VerifyOptions) {
  const spinner = ora("Checking verification...").start();

  try {
    const client = getClient();
    const result = await client.verify(options.name);

    if (!result.success) {
      spinner.fail(chalk.red(`Verification failed: ${result.error}`));
      console.log();
      console.log(chalk.gray("  Make sure you've tweeted the verification message from the agent's Twitter account."));
      console.log(chalk.gray("  The tweet must be public and contain the exact verification code."));
      process.exit(1);
    }

    spinner.succeed(chalk.green("Agent verified! ✓"));
    console.log();
    console.log(chalk.cyan("  Your agent is now verified and will receive bonus credit score points."));
    console.log(chalk.cyan("  Verified agents rank higher on the leaderboard."));
    console.log();
  } catch (error) {
    spinner.fail(chalk.red(`Error: ${error instanceof Error ? error.message : "Unknown error"}`));
    process.exit(1);
  }
}

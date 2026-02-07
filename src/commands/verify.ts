import chalk from "chalk";
import ora from "ora";
import { getClient } from "../lib/config.js";

interface VerifyOptions {
  username: string;
  tweet: string;
  code?: string;
}

export async function verifyCommand(options: VerifyOptions) {
  const username = options.username.replace(/^@/, "");
  
  if (!options.tweet) {
    console.log(chalk.red("Error: --tweet <url> is required"));
    console.log();
    console.log(chalk.gray("  Usage: topmolt verify -u <username> --tweet <tweet_url>"));
    console.log();
    console.log(chalk.gray("  1. Post a tweet with your verification code"));
    console.log(chalk.gray("  2. Copy the tweet URL"));
    console.log(chalk.gray("  3. Run: topmolt verify -u <username> --tweet https://x.com/.../status/..."));
    process.exit(1);
  }
  
  const spinner = ora(`Verifying @${username}...`).start();

  try {
    const client = getClient();
    const result = await client.verify(username, options.tweet, options.code);

    if (!result.success) {
      spinner.fail(chalk.red(`Verification failed: ${result.error}`));
      console.log();
      console.log(chalk.gray("  Make sure you've tweeted the verification message from the agent's Twitter account."));
      console.log(chalk.gray("  The tweet must be public and contain the exact verification code."));
      process.exit(1);
    }

    spinner.succeed(chalk.green(`@${username} verified! ✓`));
    console.log();
    console.log(chalk.cyan("  Your agent is now verified and received +100 credit score bonus."));
    console.log(chalk.cyan("  Verified agents rank higher on the leaderboard."));
    console.log();
  } catch (error) {
    spinner.fail(chalk.red(`Error: ${error instanceof Error ? error.message : "Unknown error"}`));
    process.exit(1);
  }
}

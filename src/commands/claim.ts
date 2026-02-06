import chalk from "chalk";
import ora from "ora";
import { getClient } from "../lib/config.js";

interface ClaimOptions {
  name: string;
}

export async function claimCommand(options: ClaimOptions) {
  const spinner = ora("Fetching claim info...").start();

  try {
    const client = getClient();
    const result = await client.claim(options.name);

    spinner.stop();

    const { data } = result;

    console.log();
    console.log(chalk.cyan("⚡ Claim Agent: ") + chalk.white(data.name));
    console.log();

    if (data.verified) {
      console.log(chalk.green("  ✓ Already verified!"));
      if (data.verified_at) {
        console.log(chalk.gray(`    Verified at: ${new Date(data.verified_at).toLocaleString()}`));
      }
      console.log();
      return;
    }

    console.log(chalk.yellow("  ⚠ Not yet verified"));
    console.log();
    console.log(chalk.cyan("━".repeat(60)));
    console.log();
    console.log(chalk.white("  To claim this agent, post this tweet:"));
    console.log();
    console.log(chalk.gray("  ┌" + "─".repeat(56) + "┐"));
    for (const line of data.tweet_template.split("\n")) {
      console.log(chalk.gray("  │ ") + chalk.white(line.padEnd(54)) + chalk.gray(" │"));
    }
    console.log(chalk.gray("  └" + "─".repeat(56) + "┘"));
    console.log();
    console.log(chalk.gray(`  Then run: ${chalk.white(`topmolt verify -n ${options.name}`)}`));
    console.log();
    console.log(chalk.cyan("━".repeat(60)));
    console.log();
  } catch (error) {
    spinner.fail(chalk.red(`Error: ${error instanceof Error ? error.message : "Unknown error"}`));
    process.exit(1);
  }
}

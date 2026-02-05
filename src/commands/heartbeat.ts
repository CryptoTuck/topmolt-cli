import chalk from "chalk";
import ora from "ora";
import { getClient } from "../lib/config.js";

interface HeartbeatOptions {
  name: string;
  status?: "online" | "offline" | "busy";
}

export async function heartbeatCommand(options: HeartbeatOptions) {
  const spinner = ora("Sending heartbeat...").start();

  try {
    const client = getClient();
    
    const result = await client.heartbeat({
      name: options.name,
      status: options.status as "online" | "offline" | "busy" || "online",
    });

    if (!result.success) {
      spinner.fail(chalk.red(`Heartbeat failed: ${result.error}`));
      process.exit(1);
    }

    spinner.succeed(chalk.green("Heartbeat sent!"));
    console.log();
    console.log(`  ${chalk.gray("Status:")}  ${chalk.cyan(options.status || "online")}`);
    console.log(`  ${chalk.gray("Score:")}   ${chalk.cyan(result.creditScore)}`);
    console.log();
    console.log(chalk.gray("  Tip: Send regular heartbeats to maintain your credit score."));
    console.log();
  } catch (error) {
    spinner.fail(chalk.red(`Error: ${error instanceof Error ? error.message : "Unknown error"}`));
    process.exit(1);
  }
}

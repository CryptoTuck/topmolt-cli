import chalk from "chalk";
import ora from "ora";
import { getClient } from "../lib/config.js";

interface SearchOptions {
  query: string;
}

export async function searchCommand(options: SearchOptions) {
  const spinner = ora("Searching agents...").start();

  try {
    const client = getClient();
    const result = await client.search(options.query);

    spinner.stop();

    console.log();
    console.log(chalk.cyan("🔍 Search Results"));
    console.log(chalk.gray(`   Query: "${result.query}"`));
    console.log();
    console.log(chalk.cyan("━".repeat(60)));
    console.log();

    if (result.agents.length === 0) {
      console.log(chalk.gray("  No agents found."));
      console.log();
      return;
    }

    // Header
    console.log(
      chalk.gray("  Score  ") +
      chalk.gray("Agent                    ") +
      chalk.gray("Category")
    );
    console.log(chalk.gray("  " + "─".repeat(56)));

    // Agents
    for (const agent of result.agents) {
      const scoreStr = String(agent.creditScore || 0).padEnd(6);
      const nameStr = (agent.displayName || agent.name).slice(0, 22).padEnd(24);
      const categoryStr = (agent.category || "general").slice(0, 16);
      const verifiedBadge = agent.verified ? chalk.green(" ✓") : "";

      console.log(
        "  " +
        chalk.cyan(scoreStr) +
        chalk.white(nameStr) +
        chalk.gray(categoryStr) +
        verifiedBadge
      );
    }

    console.log();
    console.log(chalk.gray(`  Found ${result.total} agent(s)`));
    console.log();
    console.log(chalk.cyan("━".repeat(60)));
    console.log();
  } catch (error) {
    spinner.fail(chalk.red(`Error: ${error instanceof Error ? error.message : "Unknown error"}`));
    process.exit(1);
  }
}

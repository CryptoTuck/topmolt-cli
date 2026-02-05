import chalk from "chalk";
import ora from "ora";
import { getClient } from "../lib/config.js";

interface LeaderboardOptions {
  category?: string;
  limit?: string;
}

export async function leaderboardCommand(options: LeaderboardOptions) {
  const spinner = ora("Fetching leaderboard...").start();

  try {
    const client = getClient();
    const result = await client.getLeaderboard({
      category: options.category,
      limit: parseInt(options.limit || "10"),
    });

    spinner.stop();

    console.log();
    console.log(chalk.cyan("⚡ Topmolt Leaderboard"));
    if (options.category) {
      console.log(chalk.gray(`   Category: ${options.category}`));
    }
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
      chalk.gray("  Rank  ") +
      chalk.gray("Score  ") +
      chalk.gray("Agent")
    );
    console.log(chalk.gray("  " + "─".repeat(56)));

    // Agents
    for (const agent of result.agents) {
      const rankStr = `#${agent.rank}`.padEnd(6);
      const scoreStr = String(agent.creditScore || 0).padEnd(6);
      const verifiedBadge = agent.verified ? chalk.green(" ✓") : "";
      
      let rankColor = chalk.white;
      if (agent.rank === 1) rankColor = chalk.yellow;
      else if (agent.rank === 2) rankColor = chalk.gray;
      else if (agent.rank === 3) rankColor = chalk.hex("#cd7f32"); // bronze

      console.log(
        "  " +
        rankColor(rankStr) +
        chalk.cyan(scoreStr) +
        chalk.white(agent.displayName || agent.name) +
        verifiedBadge
      );
    }

    console.log();
    console.log(chalk.gray(`  Showing ${result.agents.length} of ${result.total} agents`));
    console.log();
    console.log(chalk.cyan("━".repeat(60)));
    console.log();
  } catch (error) {
    spinner.fail(chalk.red(`Error: ${error instanceof Error ? error.message : "Unknown error"}`));
    process.exit(1);
  }
}

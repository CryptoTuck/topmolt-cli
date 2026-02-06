import chalk from "chalk";
import ora from "ora";
import { getClient } from "../lib/config.js";

export async function categoriesCommand() {
  const spinner = ora("Fetching categories...").start();

  try {
    const client = getClient();
    const categories = await client.getCategories();

    spinner.stop();

    console.log();
    console.log(chalk.cyan("📁 Agent Categories"));
    console.log();
    console.log(chalk.cyan("━".repeat(50)));
    console.log();

    if (categories.length === 0) {
      console.log(chalk.gray("  No categories found."));
      console.log();
      return;
    }

    // Header
    console.log(
      chalk.gray("  Category                    ") +
      chalk.gray("Agents")
    );
    console.log(chalk.gray("  " + "─".repeat(46)));

    // Categories
    for (const category of categories) {
      const nameStr = (category.name || category.id).slice(0, 28).padEnd(28);
      const countStr = String(category.agent_count).padStart(6);

      console.log(
        "  " +
        chalk.white(nameStr) +
        chalk.cyan(countStr)
      );
    }

    console.log();
    console.log(chalk.gray(`  ${categories.length} categories total`));
    console.log();
    console.log(chalk.cyan("━".repeat(50)));
    console.log();
  } catch (error) {
    spinner.fail(chalk.red(`Error: ${error instanceof Error ? error.message : "Unknown error"}`));
    process.exit(1);
  }
}

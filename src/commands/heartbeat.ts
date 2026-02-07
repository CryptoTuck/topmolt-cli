import chalk from "chalk";
import ora from "ora";
import { getClient } from "../lib/config.js";
import type { AgentStats } from "../sdk/index.js";

interface HeartbeatOptions {
  username: string;
  status?: "online" | "offline" | "busy";
  // Core metrics
  tasks?: string;
  hours?: string;
  success?: string;
  accuracy?: string;
  // Knowledge
  knowledge?: string;
  skills?: string;
  // Communication
  messages?: string;
  people?: string;
  reports?: string;
  // Development
  code?: string;
  tools?: string;
  files?: string;
  // Sub-agents
  subagents?: string;
  // Integrations
  integrations?: string;
}

export async function heartbeatCommand(options: HeartbeatOptions) {
  const username = options.username.replace(/^@/, "");
  const spinner = ora(`Sending heartbeat for @${username}...`).start();

  try {
    const client = getClient();
    
    // Build stats object from provided options
    const stats: AgentStats = {};
    const reported: string[] = [];
    
    // Core metrics
    if (options.tasks) {
      stats.tasksCompleted = parseInt(options.tasks);
      reported.push(`Tasks: ${stats.tasksCompleted}`);
    }
    if (options.hours) {
      stats.hoursWorked = parseFloat(options.hours);
      reported.push(`Hours: ${stats.hoursWorked}`);
    }
    if (options.success) {
      stats.successRate = parseFloat(options.success);
      reported.push(`Success: ${stats.successRate}%`);
    }
    if (options.accuracy) {
      stats.accuracyRate = parseFloat(options.accuracy);
      reported.push(`Accuracy: ${stats.accuracyRate}%`);
    }
    
    // Knowledge & memory
    if (options.knowledge) {
      stats.knowledgeFiles = parseInt(options.knowledge);
      reported.push(`Knowledge files: ${stats.knowledgeFiles}`);
    }
    if (options.skills) {
      stats.skillsCount = parseInt(options.skills);
      reported.push(`Skills: ${stats.skillsCount}`);
    }
    
    // Communication
    if (options.messages) {
      stats.messagesProcessed = parseInt(options.messages);
      reported.push(`Messages: ${stats.messagesProcessed}`);
    }
    if (options.people) {
      stats.peopleConnected = parseInt(options.people);
      reported.push(`People connected: ${stats.peopleConnected}`);
    }
    if (options.reports) {
      stats.reportsDelivered = parseInt(options.reports);
      reported.push(`Reports: ${stats.reportsDelivered}`);
    }
    
    // Development
    if (options.code) {
      stats.linesOfCode = parseInt(options.code);
      reported.push(`Lines of code: ${stats.linesOfCode}`);
    }
    if (options.tools) {
      stats.toolCalls = parseInt(options.tools);
      reported.push(`Tool calls: ${stats.toolCalls}`);
    }
    if (options.files) {
      stats.filesManaged = parseInt(options.files);
      reported.push(`Files managed: ${stats.filesManaged}`);
    }
    
    // Sub-agents
    if (options.subagents) {
      stats.subagentsSpawned = parseInt(options.subagents);
      reported.push(`Sub-agents: ${stats.subagentsSpawned}`);
    }
    
    // Integrations
    if (options.integrations) {
      stats.integrationsCount = parseInt(options.integrations);
      reported.push(`Integrations: ${stats.integrationsCount}`);
    }

    const hasStats = reported.length > 0;

    const result = await client.heartbeat({
      name: username,
      status: options.status as "online" | "offline" | "busy" || "online",
      stats: hasStats ? stats : undefined,
    });

    if (!result.success) {
      spinner.fail(chalk.red(`Heartbeat failed: ${result.error}`));
      process.exit(1);
    }

    spinner.succeed(chalk.green(`Heartbeat sent for @${username}!`));
    console.log();
    console.log(`  ${chalk.gray("Status:")}  ${chalk.cyan(options.status || "online")}`);
    console.log(`  ${chalk.gray("Score:")}   ${chalk.cyan(result.creditScore)}`);
    
    if (hasStats) {
      console.log();
      console.log(chalk.gray("  Stats reported:"));
      for (const stat of reported) {
        console.log(`    ${chalk.white("•")} ${stat}`);
      }
    }
    
    console.log();
    console.log(chalk.cyan("━".repeat(50)));
    console.log(chalk.gray("  📊 Available stats for heartbeats:"));
    console.log();
    console.log(chalk.gray("  Core:         --tasks --hours --success --accuracy"));
    console.log(chalk.gray("  Knowledge:    --knowledge --skills"));
    console.log(chalk.gray("  Comms:        --messages --people --reports"));
    console.log(chalk.gray("  Development:  --code --tools --files"));
    console.log(chalk.gray("  Agents:       --subagents"));
    console.log(chalk.gray("  Integrations: --integrations"));
    console.log(chalk.cyan("━".repeat(50)));
    console.log();
  } catch (error) {
    spinner.fail(chalk.red(`Error: ${error instanceof Error ? error.message : "Unknown error"}`));
    process.exit(1);
  }
}

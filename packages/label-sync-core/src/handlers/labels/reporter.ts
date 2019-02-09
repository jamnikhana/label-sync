import chalk from 'chalk'
import mls from 'multilines'
import { GithubLabel, GithubRepository } from '../../github'
import { RepositoryConfig } from '../../types'

import { LabelSyncOptions } from './sync'

export type LabelSyncReport = {
  repository: GithubRepository
  config: RepositoryConfig
  options: LabelSyncOptions
  additions: GithubLabel[]
  updates: GithubLabel[]
  removals: GithubLabel[]
}

/**
 *
 * Creates a human readable terminal report of Label Sync.
 * (Uses chalk to make report more lively.)
 *
 * @param report
 */
export function createTerminalReport(report: LabelSyncReport): string {
  const strictMessage = mls`
    | We haven't removed any label yet.
    | If you want us to remove them, set ${chalk.bgRedBright('strict')} to true.
  `

  return mls`
    | ${chalk.bgBlue(report.repository.full_name)}
    | ${chalk.gray('This is an autogenerated report for your project.')}
    | (dry run: "${report.options.dryRun}")
    | 
    |
    | Hey 👋 we synced your repository. Check the changes we made:
    |
    | ${chalk.bgGreen('New Labels:')}
    | ${labelsList(report.additions) || 'No new labels.'}
    |
    | ${chalk.bgYellow('Updated Labels:')}
    | ${labelsList(report.updates) || 'No updates.'}
    |
    | ${chalk.bgYellow('Removed Labels:')}
    | ${labelsList(report.removals) || 'No deadly changes.'}
    |
    | ${!report.config.strict ? strictMessage : ''}
    |
    | We used this configuration:
    | ${JSON.stringify(report.config, null, 2)}
  `

  function labelsList(labels: GithubLabel[]): string {
    return labels
      .map(label => {
        if (label.description === '') {
          return `- ${chalk.hex(label.color)(label.name)}`
        }

        return mls`
        | - ${chalk.hex(label.color)(label.name)}
        |   ${chalk.gray(label.description)}
        `
      })
      .join('\n')
  }
}

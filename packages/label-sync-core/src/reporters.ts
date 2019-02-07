import chalk from 'chalk'
import mls from 'multilines'
import * as os from 'os'

import { GithubLabel, GithubRepository, GithubIssue } from './github'
import { Config, RepositoryConfig } from './config'
import { SyncOptions, LabelSyncOptions } from './handlers'
import { RepositoryManifest } from './siblings'

const theme = {
  title: chalk.bold,
  subtitle: chalk.blue,
  p: chalk.blue,
  comment: 0,
}

/* Sync */

export type SyncReport = {
  config: Config
  options: SyncOptions
  successes: RepositorySyncSuccessReport[]
  errors: RepositorySyncErrorReport[]
  configs: RepositorySyncConfigurationErrorReport[]
}

export type RepositorySyncReport =
  | {
      status: 'success'
      report: RepositorySyncSuccessReport
    }
  | {
      status: 'error'
      report: RepositorySyncErrorReport
    }
  | {
      status: 'config'
      report: RepositorySyncConfigurationErrorReport
    }

export type RepositorySyncSuccessReport = {
  repository: GithubRepository
  config: RepositoryConfig
  manifest: RepositoryManifest
  additions: GithubLabel[]
  updates: GithubLabel[]
  removals: GithubLabel[]
  siblingsSucesses: SiblingSyncSuccessIssueSyncReport[]
  siblingsErrors: SiblingSyncErrorIssueSyncReport[]
}

export type RepositorySyncErrorReport = {
  repository: GithubRepository
  config: RepositoryConfig
  message: string
}

export type RepositorySyncConfigurationErrorReport = {
  config: RepositoryConfig
  message: string
}

/* Label Sync */

export type LabelSyncReport =
  | {
      status: 'success'
      report: LabelSyncSuccessReport
    }
  | {
      status: 'error'
      report: LabelSyncErrorReport
    }

export type LabelSyncSuccessReport = {
  repository: GithubRepository
  config: RepositoryConfig
  options: LabelSyncOptions
  additions: GithubLabel[]
  updates: GithubLabel[]
  removals: GithubLabel[]
}

export type LabelSyncErrorReport = {
  repository: GithubRepository
  config: RepositoryConfig
  options: LabelSyncOptions
  message: string
}

/* Siblings Sync */

export type SiblingSyncReport =
  | {
      status: 'success'
      repository: GithubRepository
      config: RepositoryConfig
      manifest: RepositoryManifest
      successes: SiblingSyncSuccessIssueSyncReport[]
      errors: SiblingSyncErrorIssueSyncReport[]
    }
  | { status: 'error'; message: string }

export type SiblingSyncIssueSyncReport =
  | {
      status: 'success'
      report: SiblingSyncSuccessIssueSyncReport
    }
  | {
      status: 'error'
      report: SiblingSyncErrorIssueSyncReport
    }

export type SiblingSyncSuccessIssueSyncReport = {
  issue: GithubIssue
  siblings: GithubLabel[]
}

export type SiblingSyncErrorIssueSyncReport = {
  issue: GithubIssue
  message: string
}

/**
 *
 * Generates human readable sync report.
 *
 * @param reports
 */
export function generateSyncReport(report: SyncReport): string {
  const message = mls`
  | ${theme.title('Github Label Sync Report')}
  | ${chalk.gray('This is an autogenerated report for your project.')}
  |
  | ${chalk.bold.bgYellowBright('Configuration Errors')}
  |
  | ${generateRepositorySyncConfigurationErrorsReport(report.configs)}
  |
  | ${chalk.bold.bgRed('Sync Errors')}
  |
  | ${generateRepositorySyncErrorsReport(report.errors)}
  |
  | ${chalk.bold.bgGreen('Changes')}
  |
  | ${generateRepositorySyncSuccessesReport(report.successes)}
`

  return message

  /**
   * Helper functions
   */
  function generateRepositorySyncSuccessesReport(
    reports: RepositorySyncSuccessReport[],
  ): string {
    if (reports.length === 0) {
      return `No successful sync reports.`
    }

    return mls`
    | Successfully synced labels accross ${reports.length} repositories;
    | ${reports.map(generateRepositorySyncSuccessReport).join(os.EOL)}
    `
  }

  function generateRepositorySyncErrorsReport(
    reports: RepositorySyncErrorReport[],
  ): string {
    if (reports.length === 0) {
      return `Everything looks fine.`
    }

    return mls`
    | There were some issues with ${reports.length} repositories;
    | ${reports.map(generateRepositorySyncErrorReport).join(os.EOL)}
    `
  }

  function generateRepositorySyncConfigurationErrorsReport(
    reports: RepositorySyncConfigurationErrorReport[],
  ): string {
    if (reports.length === 0) {
      return `Everything looks fine.`
    }

    return mls`
    | There were some issues with ${reports.length} configurations;
    | ${reports
      .map(generateRepositorySyncConfigurationErrorReport)
      .join(os.EOL)}
    `
  }

  function generateRepositorySyncSuccessReport(
    report: RepositorySyncSuccessReport,
  ): string {
    const message = mls`
    | Synced ${chalk.cyan(report.repository.name)}:
    | ${generateLabelsSyncReport({
      action: 'add',
      labels: report.additions,
    })}
    | ${generateLabelsSyncReport({
      action: 'update',
      labels: report.updates,
    })}
    | ${generateLabelsSyncReport({
      action: 'remove',
      labels: report.removals,
      strict: report.config.strict!,
    })}
    | 
    | Successfully connected ${report.siblingsSucesses.length} issues:
    | ${report.siblingsSucesses.map(generateSiblingSyncSuccessIssueReport)}
    |
    | Couldn't connect ${report.siblingsErrors.length} issues:
    | ${report.siblingsErrors.map(generateSiblingSyncErrorIssueReport)}
    `

    return message
  }

  function generateRepositorySyncErrorReport(
    report: RepositorySyncErrorReport,
  ): string {
    const message = mls`
    | Couldn not sync ${chalk.bgYellow(report.repository.name)}:
    | ${report.message}
    | ${chalk.bgBlueBright('Configuration')}
    | ${codeBlock(JSON.stringify(report.config, null, 2), 'json')}
    `
    return message
  }

  function generateRepositorySyncConfigurationErrorReport(
    report: RepositorySyncConfigurationErrorReport,
  ): string {
    const message = mls`
    | Found invalid configuration with error:
    | ${report.message}
    | 
    | ${chalk.bgBlueBright('Configuration')}
    | ${codeBlock(JSON.stringify(report.config, null, 2), 'json')}
    `
    return message
  }

  function generateLabelsSyncReport(
    options:
      | { action: 'add'; labels: GithubLabel[] }
      | { action: 'update'; labels: GithubLabel[] }
      | { action: 'remove'; labels: GithubLabel[]; strict: boolean },
  ) {
    switch (options.action) {
      case 'add': {
        if (options.labels.length === 0) {
          return `No new labels.`
        }

        return mls`
        | Added ${options.labels.length} labels:
        | ${options.labels.map(generateLabelSyncReport).join(os.EOL)}
        `
      }

      case 'update': {
        if (options.labels.length === 0) {
          return `No labels updated.`
        }

        return mls`
        | Updated ${options.labels.length} labels:
        | ${options.labels.map(generateLabelSyncReport).join(os.EOL)}
        `
      }

      case 'remove': {
        if (options.labels.length === 0) {
          return `No labels removed.`
        }

        if (options.strict) {
          return mls`
          | Removed ${options.labels.length} labels:
          | ${options.labels.map(generateLabelSyncReport).join(os.EOL)}
                  `
        } else {
          return mls`
          | ${options.labels.length} labels should be removed;
          | ${options.labels.map(generateLabelSyncReport).join(os.EOL)}
          |
          | To remove them, set ${chalk.bgBlueBright('strict')} 
          | property to true.
          `
        }
      }
    }
  }

  function generateLabelSyncReport(label: GithubLabel): string {
    if (label.description === '') {
      return ` \u002D ${chalk.hex(label.color)(label.name)}`
    }
    return (
      ` \u002D ${chalk.hex(label.color)(label.name)}` +
      `${os.EOL}     ${chalk.gray(label.description)}`
    )
  }

  function generateSiblingSyncSuccessIssueReport(
    report: SiblingSyncSuccessIssueSyncReport,
  ): string {
    return mls`
      | Added ${report.siblings.length} labels to issue ${report.issue.number}:
      | ${report.siblings.map(sibling => sibling.name).join(', ')}
    `
  }

  function generateSiblingSyncErrorIssueReport(
    report: SiblingSyncErrorIssueSyncReport,
  ): string {
    return mls`
      | Couldn't add siblings to issue ${report.issue.number}:
      | ${report.message}
    `
  }

  /*
   * Utils
   */

  function codeBlock(code: string, language: string): string {
    return '```' + language + os.EOL + code + '```'
  }
}

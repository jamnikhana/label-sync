import chalk from 'chalk'
import mls from 'multilines'

import { GithubLabel, GithubIssue, GithubRepository } from '../../github'
import { RepositoryManifest } from '../../manifest'

import { SiblingSyncOptions } from './sync'

export type SiblingSyncReport = {
  repository: GithubRepository
  manifest: RepositoryManifest
  options: SiblingSyncOptions
  issues: SiblingSyncIssueReport[]
}

export type SiblingSyncIssueReport = {
  issue: GithubIssue
  siblings: GithubLabel[]
}

/**
 *
 * Creates a human readable terminal report of Sibling Sync.
 * (Uses chalk to make report more lively.)
 *
 * @param report
 */
export function createTerminalReport(report: SiblingSyncReport): string {
  return mls`
    | ${chalk.bgBlueBright(report.repository.full_name)}
    | ${chalk.gray('This is an autogenerated report for your project.')}
    | (dry run: "${report.options.dryRun}")
    | 
    |
    | Hey ✌️ we synced issues in your repository. Check the changes we made:
    |
    | ${issuesList(report.issues)}
    |
    | We used this manifest:
    | ${JSON.stringify(report.manifest, null, 2)}
  `

  function issuesList(issues: SiblingSyncIssueReport[]): string {
    return issues
      .map(
        issue => mls`
          | ${chalk.bgCyan(issue.issue.title)}
          | ${chalk.gray(`Issue number: ${issue.issue.number}`)}
          |
          | Added ${issue.siblings.map(l => l.name).join(', ')}.
        `,
      )
      .join('\n')
  }
}

import * as e from 'fp-ts/lib/Either'
import * as r from 'fp-ts/lib/Record'
import * as t from 'fp-ts/lib/Task'
import { Octokit } from 'probot'

import {
  LSCConfiguration,
  LSCLabelName,
  LSCLabel,
  LSCRepository,
} from '../../data/labelsync/configuration'
import { LSLabel } from '../../data/labelsync/label'
import { getRepositoryLabels, getRepositoryIssues } from './github'

/**
 * Represents a single configuration analysis
 * report which includes information about
 * each particular repository.
 */
export interface LSConfigurationAnalysis {
  repositories: Map<
    string,
    {
      /* Configuration diff */
      createdLabels: Map<LSCLabelName, LSCLabel>
      updatedLabels: Map<
        LSCLabelName,
        {
          config: LSCLabel
          changes: string[]
        }
      >
      removedLabels: LSLabel[]
      unchangedLabels: LSLabel[]
      /* Impact */
      issues: Array<{
        /* Issue metadata */
        number: number
        name: string
        description: string
        /* Label changes */
        newLabels: string[]
        existingLabels: string[]
        removedLabels: string[]
      }>
    }
  >
}

export interface LSConfigurationAnalysisError {}

/**
 * Collects labels that concern present configuration.
 * Calculates the difference between current state and the
 * configuration.
 * Calculates the consequences of changes.
 *
 * @param octokit
 * @param config
 */
export const analyseConfiguration = (
  octokit: Octokit,
  owner: string,
  config: LSCConfiguration,
): t.Task<
  e.Either<LSConfigurationAnalysisError, LSConfigurationAnalysis>
> => async () => {
  const repos = r.mapWithIndex<
    string,
    LSCRepository,
    t.Task<LSConfigurationAnalysis>
  >((repoName, repoConfig) => async () => {
    const labelsT = getRepositoryLabels(octokit, { owner, repo: repoName })
    const issuesT = getRepositoryIssues(octokit, { owner, repo: repoName })

    const [labels, issues] = await Promise.all([labelsT(), issuesT()])

    return {} as any
  })(config.repos)

  // map record of tasks to task record
  return repos
  /* Helper functions. */
}

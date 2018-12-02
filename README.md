# github-labels 🏷

> GitHub label definitions for all of our OSS repositories including scripts to sync them to GitHub.

## Overview

`Github Labels` is a Github Action which seeks the `labels.config.json` file and, based on its content,
replicates labels across all repositories in scope.

## Features

- 🧠 `Intuitive API` allows you to seamlessly integrate Github Labels into your organization.

## Definition

Github Labels by default searches for `labels.config.json` file in the root of a repository.

```json
{
  "strict": true,
  "labels": {
    "FAQ": "#345345",
    "Feature: Request": {
      "color": "#F69ABC",
      "description": "All issues which are feature requests."
    }
  },
  "branch": "master"
}
```

## License

MIT @ Prisma

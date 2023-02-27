# Change Log

All notable changes to this project will be documented in this file.

```
Guiding Principles:

 - Changelogs are for humans, not machines.
 - There should be an entry for every single version.
 - The same types of changes should be grouped.
 - Versions and sections should be linkable.
 - The latest version comes first.
 - The release date of each version is displayed.
 - Mention whether you follow Semantic Versioning.

Types of changes:
 - Added for new features.
 - Changed for changes in existing functionality.
 - Deprecated for soon-to-be removed features.
 - Removed for now removed features.
 - Fixed for any bug fixes.
 - Security in case of vulnerabilities.

 The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

```

## [Unreleased]

- Move NPM package to organization '@xhelpers/api'.

## [4.0.0] - 2023-02-26

Dependencies have been updated to hapijs 21+ and Nodejs 18.14.1, and all subdependencies have been upgraded to the most recent version.

### Added

- New service for cron jobs to use set 'options.enableCronJob: true', base service BaseCronJobService
- New basic tests for SSO configuration
- Add momentjs as direct dependency https://momentjs.com/

### Changed

- Upgraded nodejs to version 18.14.1
- Upgraded npm to version 9.3.1
- Upgraded typescript to version 4.9.5
- Upgraded @hapi/hapi to version 21.3.0
- Upgraded @hapi/boom to version 10.0.1
- Upgraded @hapi/bell to version 13.0.1
- Upgraded @hapi/inert to version 7.0.1
- Upgraded @hapi/vision to version 7.0.1
- Upgraded hapi-swagger to version 16.0.0
- Upgraded hapi-require-https to version 6.0.0
- Upgraded mysql2 to version 3.1.2
- Upgraded sequelize to version 6.28.2
- Upgraded mongoose to version 6.9.2

- Upgraded uuid to version 9.0.0
- Upgraded dotenv to version 16.0.3
- Upgraded axios to version 1.3.3
- Upgraded jsonwebtoken to version 9.0.0
- Upgraded mocha to version 10.2.0

### Removed

- Disabled Sentry until it support @hapijs 21+

## [3.1.7] - 2022-11-27

Fix dependencies and include default exports (database, service, tools).

### Changed

- reference dependencies and export as tools.

### Fixed

- missing dependency 'hapi-require-https'

## [3.1.0] - 2022-04-02

Add axios and rabbitmq base service dependency

### Added

- New base service for axios - AxiosService
- new Base service for rabbitmq (amqp) - RabbitOperator.

## [3.0.0] - 2022-04-02

Upgraded packages to new hapi 20.2.1.

### Changed

- Upgraded packages to @hapi 20.2.1
- Upgraded packages to mongoose 6.2.8
- Mongoose Migrating from 5.x to 6.x (https://mongoosejs.com/docs/migrating_to_6.html)
- Removed default route /status 'hapijs-status-monitor'
- Removed default packages 'hapi-dev-errors'

## [2.1.19] - 2021-04-04

Add sentry integration.

### Added

- Add sentry integration.

## [2.1.18] - 2021-03-05

Custom/Override server plugins

### Added

- New function to register or override default plugins.

## [2.1.6] - 2020-06-09

Update SSO integration with @hapi/bell.

### Changed

- Updated integration usage for SSO.

## [2.1.0] - 2020-03-19

New authorization mode 'appkey'.

### Added

- [feature] Added basic auth appkey mode [#3](/../../issues/3)

## [2.0.0] - 2020-03-10

Upgrade packages to use namespace "@hapi".

### Changed

- Upgraded packages to @hapi/
- Added tests
- Added default route /status using 'hapijs-status-monitor'

## [1.1.0] - 2020-01-30

Update JWT integration and fix bugs on JWT auth.

### Changed

- New JWT integration and usage.

### Fixed

- Fixed jwt service bug.

## [1.0] - 2019-12-14

Started the project with some mixed code as simple POC.

### Added

- Base server configurations.
- Base routes, Base database service.

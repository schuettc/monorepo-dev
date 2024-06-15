import { cdk } from 'projen';
import { AwsCdkTypeScriptApp } from 'projen/lib/awscdk';
const { JobPermission } = require('projen/lib/github/workflows-model');
const { UpgradeDependenciesSchedule } = require('projen/lib/javascript');
const AUTOMATION_TOKEN = 'PROJEN_GITHUB_TOKEN';

const root = new cdk.JsiiProject({
  author: 'Court Schuett',
  authorAddress: 'schuettc@amazon.com',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.4.0',
  name: 'anthropic-on-aws-dev',
  projenrcTs: true,
  jest: false,
  repositoryUrl: 'https://github.com/schuettc/anthropic-on-aws-dev.git',
});

new AwsCdkTypeScriptApp({
  parent: root,
  cdkVersion: '2.130.0',
  defaultReleaseBranch: 'main',
  outdir: 'cdk-demo',
  name: 'cdk-demo',
  devDeps: ['esbuild', 'cdk-nag'],
  deps: ['dotenv', 'fs-extra', '@types/fs-extra', '@types/aws-lambda'],
  appEntrypoint: 'claude-tools-chatbot.ts',
  depsUpgradeOptions: {
    workflowOptions: {
      labels: ['auto-approve', 'auto-merge'],
      schedule: UpgradeDependenciesSchedule.WEEKLY,
    },
  },
  autoApproveOptions: {
    secret: 'GITHUB_TOKEN',
    allowedUsernames: ['schuettc'],
  },
  autoApproveUpgrades: true,
});

const common_exclude = [
  '.yalc',
  'cdk.out',
  'cdk.context.json',
  'yarn-error.log',
  'dependabot.yml',
  '.DS_Store',
  '.venv',
  'src/resources/resolverLambda/bin/**',
  'src/resources/resolverLambda/lib/**',
  'src/resources/initializerLambda/bin/**',
  'src/resources/initializerLambda/lib/**',
  '.graphqlconfig.yaml',
  'cdk-neg-output.txt',
];

root.gitignore.exclude(...common_exclude);
root.synth();

const { NodeProject } = require('projen/lib/javascript');
const cdkDemoConfig = require('./subprojects/cdk-demo');

const root = new NodeProject({
  name: 'monorepo-dev',
  defaultReleaseBranch: 'main',
  license: 'MIT-0',
  author: 'Court Schuett',
  copyrightOwner: 'Amazon.com, Inc.',
  authorAddress: 'https://aws.amazon.com',
});

cdkDemoConfig(root);

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
  'cdk-nag-output.txt',
];

root.gitignore.exclude(...common_exclude);
root.synth();

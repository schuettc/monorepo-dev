const { AwsCdkTypeScriptApp } = require('projen/lib/awscdk');
const addUpgradeSiteWorkflow = require('./workflows.ts');
const addBuildWorkflow = require('./workflows.ts');
const { NodeProject } = require('projen/lib/javascript');
const { UpgradeDependenciesSchedule } = require('projen/lib/javascript');

const root = new NodeProject({
  name: 'monorepo-dev',
  defaultReleaseBranch: 'main',
});

const cdkDemoProject = new AwsCdkTypeScriptApp({
  parent: root,
  cdkVersion: '2.130.0',
  defaultReleaseBranch: 'main',
  outdir: 'cdk-demo',
  name: 'cdk-demo',
  devDeps: ['esbuild', 'cdk-nag'],
  deps: ['dotenv', 'fs-extra', '@types/fs-extra', '@types/aws-lambda'],
  appEntrypoint: 'cdk-demo.ts',
  depsUpgradeOptions: {
    workflow: true,
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
  depsUpgrade: true,
});

cdkDemoProject.addTask(`launch:${cdkDemoProject.name}`, {
  exec: 'yarn cdk bootstrap && yarn cdk deploy  --require-approval never && yarn configLocal',
});

root.addUpgradeSiteWorkflow('cdk-demo');
root.addBuildWorkflow('cdk-demo');

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

cdkDemoProject.tsconfigDev.file.addOverride('include', ['src/*.ts']);

// root.tsconfigDev.file.addOverride('include', [
//   './.projenrc.ts',
//   './workflows.ts',
// ]);

cdkDemoProject.eslint.addOverride({
  files: ['./*.ts'],
  rules: {
    '@typescript-eslint/no-require-imports': 'off',
    'import/no-extraneous-dependencies': 'off',
  },
});

root.gitignore.exclude(...common_exclude);
root.synth();

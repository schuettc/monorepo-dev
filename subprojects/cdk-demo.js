const { AwsCdkTypeScriptApp } = require('projen/lib/awscdk');
const { UpgradeDependenciesSchedule } = require('projen/lib/javascript');
const addUpgradeProjectWorkflow = require('../workflows.ts');
const addBuildWorkflow = require('../workflows.ts');

module.exports = function (root) {
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
    exec: 'yarn cdk bootstrap && yarn cdk deploy --require-approval never && yarn configLocal',
  });

  cdkDemoProject.tsconfigDev.file.addOverride('include', ['src/*.ts']);
  cdkDemoProject.eslint.addOverride({
    files: ['./*.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'import/no-extraneous-dependencies': 'off',
    },
  });

  root.addUpgradeProjectWorkflow('cdk-demo', 'cdk-demo/site');
  root.addBuildWorkflow('cdk-demo');

  cdkDemoProject.synth();

  return cdkDemoProject;
};

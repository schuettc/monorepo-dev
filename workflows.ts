const { JobPermission } = require('projen/lib/github/workflows-model');
const { NodeProject } = require('projen/lib/javascript');
const AUTOMATION_TOKEN = 'PROJEN_GITHUB_TOKEN';

// declare module 'projen' {
//   interface Project {
//     addUpgradeSiteWorkflow(projectName: string): void;
//   }
// }

NodeProject.prototype.addUpgradeSiteWorkflow = function (projectName) {
  const upgradeSite = this.github.addWorkflow('upgrade-' + projectName);
  upgradeSite.on({ schedule: [{ cron: '0 0 * * 1' }], workflowDispatch: {} });

  upgradeSite.addJobs({
    [`upgrade-${projectName}`]: {
      runsOn: ['ubuntu-latest'],
      name: `upgrade-${projectName}`,
      permissions: {
        actions: JobPermission.WRITE,
        contents: JobPermission.READ,
        idToken: JobPermission.WRITE,
      },
      steps: [
        { uses: 'actions/checkout@v3' },
        {
          name: 'Setup Node.js',
          uses: 'actions/setup-node@v3',
          with: {
            'node-version': '20',
          },
        },
        {
          run: 'yarn install --check-files --frozen-lockfile',
          workingDirectory: projectName,
        },
        { run: 'yarn upgrade', workingDirectory: projectName },
        {
          name: 'Create Pull Request',
          uses: 'peter-evans/create-pull-request@v4',
          with: {
            'token': '${{ secrets.' + AUTOMATION_TOKEN + ' }}',
            'commit-message': `chore: upgrade ${projectName}`,
            'branch': `auto/projen-upgrade-${projectName}`,
            'title': `chore: upgrade ${projectName}`,
            'body': `This PR upgrades ${projectName}`,
            'labels': 'auto-merge, auto-approve',
            'author': 'github-actions <github-actions@github.com>',
            'committer': 'github-actions <github-actions@github.com>',
            'signoff': true,
          },
        },
      ],
    },
  });
};

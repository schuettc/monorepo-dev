const { NodeProject } = require('projen/lib/javascript');
const cdkDemoConfig = require('./subprojects/cdk-demo');
const cookbookProject = require('./subprojects/cookbooks');

const root = new NodeProject({
  name: 'monorepo-dev',
  defaultReleaseBranch: 'main',
  license: 'MIT-0',
  author: 'Court Schuett',
  copyrightOwner: 'Amazon.com, Inc.',
  gitpod: true,
  authorAddress: 'https://aws.amazon.com',
});

cdkDemoConfig(root);
cookbookProject(root);

const common_exclude = [
  '.yalc',
  'cdk.out',
  'cdk.context.json',
  'yarn-error.log',
  'dependabot.yml',
  '.DS_Store',
  '.venv',
  'cdk-nag-output.txt',
];

const addWorkflow = root.github.addWorkflow('sns-publish');
addWorkflow.on({
  push: {
    branches: ['main'],
  },
  pullRequest: {
    branches: ['main'],
  },
  workflowDispatch: {},
});

addWorkflow.addJobs({
  publish: {
    runsOn: ['ubuntu-latest'],
    permissions: {
      'contents': 'read',
      'id-token': 'write',
    },
    steps: [
      {
        name: 'Checkout',
        uses: 'actions/checkout@v3',
      },
      {
        name: 'Configure AWS Credentials',
        uses: 'aws-actions/configure-aws-credentials@v1',
        with: {
          'aws-access-key-id': '${{ secrets.AWS_ACCESS_KEY_ID }}',
          'aws-secret-access-key': '${{ secrets.AWS_SECRET_ACCESS_KEY }}',
          'aws-region': 'us-east-1',
        },
      },
      {
        name: 'Publish to SNS',
        uses: 'schuettc/sns-action@v1',
        with: {
          topicArn: '${{ secrets.SNS_TOPIC_ARN }}',
          message: 'Test message from consumer project',
          subject: 'Test Notification',
          region: 'us-east-1',
        },
      },
    ],
  },
});

root.gitignore.exclude(...common_exclude);
root.synth();

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
      'pull-requests': 'read',
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
        name: 'Generate Event Message',
        id: 'generate-message',
        run: `
          echo "Generating detailed message based on event type"
          if [[ "\${{ github.event_name }}" == "pull_request" ]]; then
            echo 'message={
              "event_type": "pull_request",
              "action": "\${{ github.event.action }}",
              "pr_number": "\${{ github.event.pull_request.number }}",
              "pr_title": "\${{ github.event.pull_request.title }}",
              "pr_body": "\${{ github.event.pull_request.body }}",
              "author": "\${{ github.event.pull_request.user.login }}",
              "base_branch": "\${{ github.event.pull_request.base.ref }}",
              "head_branch": "\${{ github.event.pull_request.head.ref }}",
              "repo_full_name": "\${{ github.repository }}",
              "html_url": "\${{ github.event.pull_request.html_url }}",
              "diff_url": "\${{ github.event.pull_request.diff_url }}",
              "changed_files": "\${{ github.event.pull_request.changed_files }}",
              "additions": "\${{ github.event.pull_request.additions }}",
              "deletions": "\${{ github.event.pull_request.deletions }}"
            }' >> $GITHUB_OUTPUT
          else
            echo 'message={"event_type": "\${{ github.event_name }}", "details": "Event details not configured for this type"}' >> $GITHUB_OUTPUT
          fi
        `,
      },
      {
        name: 'Publish to SNS',
        uses: 'schuettc/sns-action@v0.0.0',
        with: {
          topicArn: '${{ secrets.SNS_TOPIC_ARN }}',
          message: '${{ steps.generate-message.outputs.message }}',
          subject:
            'GitHub Event: ${{ github.event_name }} in ${{ github.repository }}',
          region: 'us-east-1',
        },
      },
    ],
  },
});

root.gitignore.exclude(...common_exclude);
root.synth();

import { cdk } from 'projen';
const project = new cdk.JsiiProject({
  author: 'Court Schuett',
  authorAddress: 'schuettc@amazon.com',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.4.0',
  name: 'anthropic-on-aws-dev',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/schuettc/anthropic-on-aws-dev.git',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();
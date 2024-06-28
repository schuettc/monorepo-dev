const { python } = require('projen');

module.exports = function (root) {
  const cookbookProject = new python.PythonProject({
    paren: root,
    outdir: 'cookbooks',
    name: 'cookbooks',
    authorEmail: 'schuettc@amazon.com',
    authorName: 'Court Schuett',
    gitpod: true,
    moduleName: 'cookbooks',
    projenrcTs: true,
    pythonExec: 'python3',
    deps: ['boto3'],
    version: '0.1.0',
    venv: true,
  });

  cookbookProject.synth();

  return cookbookProject;
};

const core = require('@actions/core');
// const github = require('@actions/github');
const exec = require('@actions/exec');
const standardVersion = require('standard-version');


core.debug("Running rust auto bumper");
const bump = async () => {
    try {
        // `who-to-greet` input defined in action metadata file
        const token = core.getInput('personal-access-token');

        core.debug("Running rust auto bumper inside");

        if( token.length === 0 ) {
            core.setFailed("`personal-access-token must be set")
        }
        const branch = core.getInput('branch');
        //   console.log(`Hello ${nameToGreet}!`);
        //   const time = (new Date()).toTimeString();
        //   core.setOutput("time", time);
        // Get the JSON webhook payload for the event that triggered the workflow
        // const repo = process.env.REPO;
        // const repo = process.env.GITHUB_ACTOR;
        await exec.exec(`git remote add github "$REPO"`);
        await exec.exec('git config --local user.email "action@github.com"');
        await exec.exec('git config --local user.name "GitHub Action"');
        
        let actor = process.env.GITHUB_ACTOR;
        let repo = process.env.GITHUB_REPOSITORY;
        core.debug(`The repo: ${repo}`);
        core.debug(`The actor: ${actor}`);
    
        core.debug("github setup locally");
        core.debug(`git branch: ${branch}`);
    //   const payload = JSON.stringify(github.context.payload, undefined, 2)
        // await exec.exec('yarn standard-version -a');
    
        await standardVersion({
            noVerify: true,
            silent: false
          });
          
          core.debug("Version bumped successfully");
          
    
        core.debug(`Attempting to push to ${branch}`);
        // git push --follow-tags origin HEAD
        await exec.exec(`git push "https://${actor}:${token}@github.com/${repo}" HEAD:${branch} --tags`);
    
    } catch (error) {
      core.setFailed(error.message);
    }

}


bump()
// name: Version Bump and Tag

// on:
//   # Trigger the workflow on push only for the master branch
//   push:
//     branches:
//       - master

// env:
//   NODE_ENV: 'development'
//   GITHUB_TOKEN: ${{ secrets.PERSONAL_GITHUB_TOKEN }}

// jobs:
//   bump:
//     runs-on: ubuntu-latest
//     if: "!startsWith(github.event.head_commit.message, 'chore(release):')"
//     steps:
//       - uses: actions/checkout@v1
//       - uses: actions/setup-node@v1
//         with:
//           node-version: "14.x"
//       - name: Setup git
//         run: |
//           git remote add github "$REPO"
//           git config --local user.email "action@github.com"
//           git config --local user.name "GitHub Action"
//       - name: Bump Version
//         run: npx standard-version -a 
//       - name: Push changes & tags to master
//         run: git push "https://$GITHUB_ACTOR:$GITHUB_TOKEN@github.com/$GITHUB_REPOSITORY" HEAD:master --tags

  
  
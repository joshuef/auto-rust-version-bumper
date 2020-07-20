const core = require('@actions/core');
// const github = require('@actions/github');
const exec = require('@actions/exec');
const standardVersion = require('standard-version');

const bump = async () => {
    try {
        // `who-to-greet` input defined in action metadata file
        const token = core.getInput('personal_access_token');
        //   console.log(`Hello ${nameToGreet}!`);
        //   const time = (new Date()).toTimeString();
        //   core.setOutput("time", time);
        // Get the JSON webhook payload for the event that triggered the workflow
        // const repo = process.env.REPO;
        // const repo = process.env.GITHUB_ACTOR;
        core.debug(`The repo: $REPO`);
        core.debug(`The repo: $GITHUB_ACTOR`);
    
        await exec.exec(`git remote add github "$REPO"`);
        await exec.exec('git config --local user.email "action@github.com"');
        await exec.exec('git config --local user.name "GitHub Action"');
    
        core.debug("github setup locally");
    //   const payload = JSON.stringify(github.context.payload, undefined, 2)
        // await exec.exec('yarn standard-version -a');
    
        await standardVersion({
            noVerify: true,
            silent: false
          });
          
          core.debug("Version bumped successfully");
          
    
        core.debug("Version bumped successfully");
        await exec.exec(`git push https://$GITHUB_ACTOR:$GITHUB_TOKEN@github.com/$REPO" HEAD:master --tags`);
    
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

  
  
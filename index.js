const core = require('@actions/core');
const exec = require('@actions/exec');
const github = require('@actions/github');
const standardVersion = require('standard-version');
const toml = require('@iarna/toml')
const fs = require('fs');

const bump = async () => {
    try {
        core.debug("Running rust auto bumper ");
        const token = core.getInput('personal-access-token');
        const branch = core.getInput('branch');
        
        if( token.length === 0 ) {
            core.setFailed("`personal-access-token must be set")
        }

        await exec.exec('git config --local user.email "action@github.com"');
        await exec.exec('git config --local user.name "GitHub Action"');

        let actor = process.env.GITHUB_ACTOR;
        let repo = process.env.GITHUB_REPOSITORY;
    
        // bump the version
        await standardVersion({
            noVerify: true,
            silent: false,
          });
        
        // get info for update to commit + cargo
        let version = '';
        let myError = '';

        const versionOptions = {};
        versionOptions.listeners = {
          stdout: (data) => {
            version += data.toString();
          },
          stderr: (data) => {
            myError += data.toString();
          }
        };

        await exec.exec('git', ['describe', '--tags'], versionOptions);

        version = version.trim();
        cargo_version = version.replace('v', '');
        let commit_message = '';
        core.debug(`Version bumped successfully to ${version}`);

        const msg_options = {};
        msg_options.listeners = {
          stdout: (data) => {
            commit_message += data.toString();
          },
          stderr: (data) => {
            myError += data.toString();
          }
        };

        await exec.exec('git', ['log', '-1', '--pretty=%B'], msg_options);
        core.debug(`Commit message added was: ${commit_message}`);

        // parse and update cargo.toml
        let cargo = fs.readFileSync('Cargo.toml');

        var json = toml.parse(cargo);
        // special vargo version to remove "v"
        json.package.version = cargo_version;

        let cargoUpdated = toml.stringify(json);

        fs.writeFileSync('Cargo.toml', cargoUpdated);

        // commit changes
        await exec.exec('git', ['reset', '--soft', 'HEAD~1']);
        await exec.exec('git', ['add', '--all']);        
        await exec.exec('git', ['commit', '-m', commit_message]);
        await exec.exec('git', ['tag', version, '-f']);

        let branchName = `version-bump-${version}`;

        // update branch with changes
        core.debug(`Creating a new branch: ${branchName}`);

        // first push without tags, in case this fails for some reason
        await exec.exec(`git push "https://${actor}:${token}@github.com/${repo}" HEAD:${branchName} -f`);

        // then push with tags
        // await exec.exec(`git push "https://${actor}:${token}@github.com/${repo}" HEAD:${branch} --tags`);

        let owner = repo.split('/')[0];
        let repoForOctokit = repo.split('/')[1];

        const octokit = github.getOctokit(token);

        let pr = await octokit.pulls.create({
          owner,
          repo: repoForOctokit,
          title: `Automated version bump + changelog for ${version}`,
          head: branchName,
          base : 'master'
      });

      core.debug(`THE PR::::: response: ${pr}`);


      // merge the PR
      octokit.pulls.merge({
        owner,
        repo,
        pull_number,
      });


      // octokit.pulls.createReview({
      //           owner,
      //   repo,
      //   pull_number,
      //   comments[].path,
      //   comments[].position,
      //   comments[].body
      //         })

        // github create PR.

    
    } catch (error) {
      core.setFailed(error.message);
    }

}


bump()
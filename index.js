const core = require('@actions/core');
const exec = require('@actions/exec');
const standardVersion = require('standard-version');
const toml = require('@iarna/toml')


const bump = async () => {
    try {
        core.debug("Running rust auto bumper ");
        const token = core.getInput('personal-access-token');
        const branch = core.getInput('branch');
        
        if( token.length === 0 ) {
            core.setFailed("`personal-access-token must be set")
        }

        // await exec.exec(`git remote add github "$REPO"`);
        await exec.exec(`ls -la`);
        await exec.exec('git config --local user.email "action@github.com"');
        await exec.exec('git config --local user.name "GitHub Action"');

        let actor = process.env.GITHUB_ACTOR;
        let repo = process.env.GITHUB_REPOSITORY;
        core.debug(`The repo: ${repo}`);
        core.debug(`The actor: ${actor}`);
    
        core.debug(`git branch: ${branch}`);
    
        // bump the version
        await standardVersion({
            noVerify: true,
            silent: false,
          });
        
        // modify cargo.toml
        let tags = exec.exec("git describe --tags");


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
        json.package.version = version;

        let cargoUpdated = toml.stringify(json);

        fs.writeFileSync('Cargo.toml', cargoUpdated);

        // commit changes
        await exec.exec('git', ['reset', '--soft', 'HEAD~1']);
        await exec.exec('git', ['commit', '-m', commit_message]);
        // core.exportVariable('VERSION', version);

        // update branch with changes
        core.debug(`Attempting to push to ${branch}`);

        await exec.exec(`git push "https://${actor}:${token}@github.com/${repo}" HEAD:${branch} --tags`);
    
    } catch (error) {
      core.setFailed(error.message);
    }

}


bump()
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
    
        await standardVersion({
            noVerify: true,
            silent: false,
            // bumpFiles: [{ 
            //     fileName: 'Cargo.toml',
            //     updater: {
            //         readVersion: () => {
            //             var json = toml.parse(contents);

            //             return  json.package.version
            //         },
            //         writeVersion: () => {
            //             var json = toml.parse(contents);
            //             json.package.version = version;
                    
            //             return toml.stringify(json)
            //         }
            //     }
            // }]
          });
          
          core.debug("Version bumped successfully");
          
    
        core.debug(`Attempting to push to ${branch}`);

        await exec.exec(`git push "https://${actor}:${token}@github.com/${repo}" HEAD:${branch} --tags`);
    
    } catch (error) {
      core.setFailed(error.message);
    }

}


bump()
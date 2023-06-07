import { BaseCommand } from '@yarnpkg/cli';
import {
  Configuration,
  Descriptor,
  Hooks,
  MessageName,
  Plugin,
  Project,
  SettingsType,
  StreamReport,
  structUtils,
} from '@yarnpkg/core';
import { dedupeUtils } from '@yarnpkg/plugin-essentials';

const CANARY_REGEX = /[0-9]-canary-/;

class CheckCanary extends BaseCommand {
  static override paths = [['check-canary']];

  async execute() {
    const configuration = await Configuration.find(this.context.cwd, this.context.plugins);
    const { project } = await Project.find(configuration, this.context.cwd);

    const report = await StreamReport.start({
      configuration,
      stdout: this.context.stdout,
    }, async report => {

      for (const workspace of project.workspaces) {
        // check package.json
        const prefix = `package.json for ${structUtils.prettyWorkspace(configuration, workspace)} contains `;
        const checkDescriptorsForCanary = (descriptors: Iterable<Descriptor>) => {
          for (const descriptor of descriptors) {
            if (CANARY_REGEX.test(descriptor.range)) {
              report.reportError(
                MessageName.UNNAMED,
                `${prefix}${structUtils.prettyDescriptor(configuration, descriptor)}`
              );
            }
          }
        }

        checkDescriptorsForCanary(workspace.manifest.dependencies.values());
        checkDescriptorsForCanary(workspace.manifest.devDependencies.values());
      }

      // check yarn.lock
      for (const pkg of project.originalPackages.values()) {
        if (CANARY_REGEX.test(pkg.reference)) {
          report.reportError(
            MessageName.UNNAMED,
            `yarn.lock contains ${structUtils.prettyLocator(configuration, pkg)}`
          );
        }
      }
    });

    return report.exitCode();
  }
}

class CheckDupes extends BaseCommand {
  static override paths = [['check-dupes']];

  async execute() {
    const configuration = await Configuration.find(this.context.cwd, this.context.plugins);
    return await this.cli.run([
      'dedupe',
      '--check',
      '--strategy',
      configuration.get('dedupeStrategy'),
    ]);
  }
}

class FixDupes extends BaseCommand {
  static override paths = [['fix-dupes']];

  async execute() {
    const configuration = await Configuration.find(this.context.cwd, this.context.plugins);
    return await this.cli.run([
      'dedupe',
      '--strategy',
      configuration.get('dedupeStrategy'),
    ]);
  }
}

const afterAllInstalled: Hooks['afterAllInstalled'] = async ({ configuration, cwd }, { report, cache }) => {
  // we have to reload the project as there's something different about the
  // project given to us in the hook
  const { project } = await Project.find(configuration, cwd);

  const duplicates = await dedupeUtils.dedupe(project, {
    patterns: [],
    report,
    cache,
    strategy: configuration.get('dedupeStrategy') as dedupeUtils.Strategy,
  });

  if (duplicates > 0) {
    report.reportError(
      MessageName.UNNAMED,
      `Run \`yarn fix-dupes\` to remove duplicates`
    );
  }
};

declare module '@yarnpkg/core' {
  interface ConfigurationValueMap {
    dedupeStrategy: string;
  }
}

const plugin: Plugin = {
  commands: [ CheckCanary, CheckDupes, FixDupes ],
  hooks: {
    afterAllInstalled,
  },
  configuration: {
    dedupeStrategy: {
      description: 'The dedupe strategy to use',
      type: SettingsType.STRING,
      default: 'highest',
    },
  },
};

export default plugin;

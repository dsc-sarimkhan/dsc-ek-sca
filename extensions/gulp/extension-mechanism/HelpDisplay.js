const { tree } = require('gulp');
const {colorText, bold, color} = require('ns-logs');
const fs = require('fs');
const path = require('path');

// Read gulp tasks files comments to print command help in the terminal
// Comment usage example for files:
/**
 * Uploads an extension to the File Cabinet and creates or updates necessary records.
 *
 * @task {extension:deploy}
 * @order {2}
 * @group {Common tasks}
 * @arg {create} Creates a new extension, instead of updating the current one.
 * @arg {to} Asks for credentials, ignoring .nsdeploy file.
 */
// gulp.task('extension:deploy', gulp.series(compilation_tasks));

class HelpDisplay {
    constructor() {
        this.tasks = tree().nodes;
        this.commandHelp = this.getHelpChunks();
        this.displayHelp();
    }

    getHelpChunks() {
        const tasksDir = 'gulp/tasks';
        const taskContents = fs
            .readdirSync(tasksDir)
            .map((fileName) => fs.readFileSync(path.join(tasksDir, fileName)).toString())
            .join('');

        const rawChunks = taskContents.match(new RegExp(/\/\*([^*]|(\*+([^*/])))*\s\*\/\n\s?gulp\.task/, 'g')) || [];
        const endOfParamRegex = '([^*])+';
        const chunks = rawChunks.map((rawChunk) => {
            // Comment @parameters
            const [ helpText ] = this.getParamObject(rawChunk, new RegExp(/[\w].[^@]+/, 's'));
            const [ name ] = this.getParamObject(rawChunk, new RegExp(`@task ${endOfParamRegex}`));
            const args = this.getParamObject(rawChunk, new RegExp(`@arg ${endOfParamRegex}`, 'g'));
            let [ group ] = this.getParamObject(rawChunk, new RegExp(`@group ${endOfParamRegex}`));
            let [ order ] = this.getParamObject(rawChunk, new RegExp(`@order ${endOfParamRegex}`));

            // Defaults
            order = order ? Number(order.content) : Infinity;
            group = group ? group.content : 'Common tasks';

            return { helpText, name, group, order, args };
        });

        return chunks
            .filter((chunk) => chunk.name && this.tasks.includes(chunk.name.content))
            .sort((chunkA, chunkB) => chunkA.order - chunkB.order);
    }

    getHelpByGroup() {
        // Return help groups obj by @group comment parameter
        const chunkGroups = {};
        this.commandHelp.forEach((chunk) => {
            chunkGroups[chunk.group] = chunkGroups[chunk.group] || [];
            chunkGroups[chunk.group].push(chunk);
        });
        return chunkGroups;
    }

    getParamObject(rawChunk, regex) {
        // Parse a comment parameter and return an object content: string, description: string
        // Param string example: @arg {content} description
        const params = rawChunk.match(regex) || [];
        return params.map((param) => {
            const paramStr = param.trim();
            let content;
            let description;
            if (param.startsWith('@')) {
                [ content ] = param.match('{.+}') || [];
                [ description ] = param.match('}.+') || [];
                content = (content || '').slice(1).slice(0, -1).trim();
                description = (description || '').slice(1).trim();
            } else {
                content = paramStr.slice(0, -1).replace(/\n(.)+\*\s+/g, '\n$1').trim();
            }

            return description ? { content, description } : { content };
        });
    }

    displayHelp() {
        const help = this.getHelpByGroup();
        const groupMinIdentation = ' ';
        const taskMinIdentation = ' '.repeat(4);
        const argMinIdentation = ' '.repeat(6);

        console.log(bold('Usage: gulp [task] [options]'));
        console.log(bold('Tasks:'));
        Object.keys(help).forEach((group) => {
            console.log(groupMinIdentation + bold(group));

            help[group].forEach((task) => {
                const identation = ' '.repeat(taskMinIdentation.length + task.name.content.length);
                // display task name and task description
                console.log(
                    `${taskMinIdentation + bold(colorText(color.CYAN,task.name.content))} ${bold(
                        task.helpText.content.replace(/\n\s/g, `\n${identation} `)
                    )}`
                );

                // display task arguments
                task.args.forEach((arg) => {
                    const argPrefix = '--';
                    const identationLength =
                        task.name.content.length -
                        arg.content.length -
                        argPrefix.length -
                        (argMinIdentation.length - taskMinIdentation.length) +
                        1;
                    const identation = ' '.repeat(identationLength > 0 ? identationLength : 1);
                    console.log(
                        `${argMinIdentation}${bold(colorText(color.GREEN, argPrefix + arg.content))}${identation + arg.description}`
                    );
                });
                // line break
                console.log();
            });
        });
    }
}

module.exports = HelpDisplay;

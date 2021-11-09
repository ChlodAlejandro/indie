/*
 * Indie.ts
 *
 * Main entrypoint for Indie. This will be executed whenever running
 * `indie` from the terminal.
 */

import yargs from "yargs/yargs";
import Logger from "bunyan";
import bunyanFormat from "bunyan-format";
import {hideBin} from "yargs/helpers";
import {InferredOptionTypes} from "yargs";
import path from "path";
import {ChecklistResult} from "./core/checklists/Checklist";
import PreflightChecklist from "./core/checklists/PreflightChecklist";
import Commands from "./cli/Commands";

export default class Indie {

    // Raw require in order to circumvent `rootDir` limitation. `build` and `src`
    // directories lie on the same level, so there's no need to worry about discrepancies.
    static readonly PACKAGE = require(path.resolve(__dirname, "../package.json"));
    static readonly ARGUMENTS = <const>{
        verbose: {
            alias: ["d", "debug"],
            type: "count",
            description: "Verbosity flag. Up to 3 allowed."
        },
        daemon: {
            type: "boolean",
            default: false,
            hidden: true,
            description:
                "Starts the daemon. This is used internally. Users should control " +
                "the daemon using the `daemon` subcommand instead."
        }
    };

    static argv : InferredOptionTypes<typeof Indie.ARGUMENTS>;
    static log : Logger;

    static async main() : Promise<void> {
        const argf = yargs(hideBin(process.argv))
            .usage("Usage: indie [options] <subcommand> [options]")
            .version(this.PACKAGE.version)
            .alias("h", "help")
            .alias("v", "version")
            .options(this.ARGUMENTS)
            .demandCommand(1)
            .epilogue(
                "Licensed under the GNU GPL v3.0 License. " +
                "Made with love by indie developers."
            );

        for (const command of Commands) {
            argf.command(command.name, command.description);
        }

        this.argv = argf.parseSync();

        this.log = Logger.createLogger({
            name: "indie",
            level: 30 - (this.argv.verbose * 10),
            stream: bunyanFormat({
                outputMode: "short",
                levelInString: true
            }, process.stdout)
        });

        this.log.trace(this.argv);

        // Run preflight checklist.
        PreflightChecklist.run(this);
        if (PreflightChecklist.R.result === ChecklistResult.FAIL)
            process.exit(1);


    }

}

Indie.main();

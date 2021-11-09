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

export default class IndieEntrypoint {

    // Raw require in order to circumvent `rootDir` limitation. `build` and `src`
    // directories lie on the same level, so there's no need to worry about discrepancies.
    static readonly PACKAGE = require(path.resolve(__dirname, "../package.json"));
    static readonly ARGUMENTS = <const>{
        v: {
            type: "boolean",
            default: false,
            description: "Shows the Indie version and exits immediately."
        },
        d: {
            alias: ["verbose", "debug"],
            type: "count",
            default: 0,
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

    static argv : InferredOptionTypes<typeof IndieEntrypoint.ARGUMENTS>;
    static log : Logger;

    static async main() : Promise<void> {
        this.argv = yargs(hideBin(process.argv)).options(this.ARGUMENTS).parseSync();

        if (this.argv.v) {
            process.stdout.write(this.PACKAGE.version);
            if (process.stdout.isTTY)
                process.stdout.write("\n");
            process.exit();
        }

        this.log = Logger.createLogger({
            name: "indie",
            level: process.env.NODE_ENV === "development" ? 10 : 30,
            stream: bunyanFormat({
                outputMode: "short",
                levelInString: true
            }, process.stdout)
        });

        // Run preflight checklist.
        PreflightChecklist.run(this);
        if (PreflightChecklist.R.result === ChecklistResult.FAIL)
            process.exit(1);
    }

}

IndieEntrypoint.main();

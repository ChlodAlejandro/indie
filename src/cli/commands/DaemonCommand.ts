import CommandBase from "./CommandBase";
import Indie from "../../Indie";

export default class DaemonCommand extends CommandBase {

    readonly name = "daemon";
    readonly description = "Manage the Indie daemon";

    handleCommand(argv: typeof Indie.argv): void | Promise<void> {
        return undefined;
    }

}

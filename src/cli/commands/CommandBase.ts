import Indie from "../../Indie";

export default abstract class CommandBase {

    abstract name : string;
    abstract description : string;
    abstract handleCommand(argv : typeof Indie.argv) : void | Promise<void>;

}

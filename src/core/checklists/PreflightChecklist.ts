import Indie from "../../Indie";
import Checklist, {Check, PerformedChecklist} from "./Checklist";
import os from "os";

export default class PreflightChecklist {

    private static readonly CHECKLIST = <const>{
        OS_PLATFORM: <Check<typeof Indie>>{
            required: true,
            check() {
                if (os.platform() === "win32") {
                    this.log.fatal("Indie is not built to work for Windows computers.");
                    return false;
                }
                return true;
            }
        },
        OS_PLATFORM_LINUX: <Check<typeof Indie>>{
            check() {
                if (os.platform() !== "linux") {
                    this.log.warn("Indie might not work properly on non-Linux systems.");
                    this.log.warn("If you experience any compatibility issues, please notify the development team.");
                    return false;
                }
                return true;
            }
        },
        DAEMON_ROOT: <Check<typeof Indie>>{
            required: true,
            check() {
                this.log.fatal("Need to run daemon as root (privilege de-escalation will be done post-startup).")
                return !this.argv.daemon || process.getuid() === 0
            }
        }
    };

    // Results
    static R : PerformedChecklist<typeof Indie, typeof PreflightChecklist.CHECKLIST>;

    static run(entrypoint: typeof Indie) : typeof PreflightChecklist.R {
        return this.R = new Checklist(entrypoint).performChecks(this.CHECKLIST);
    }

};

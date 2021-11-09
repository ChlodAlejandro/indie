import IndieEntrypoint from "../../Indie";
import Checklist, {Check, PerformedChecklist} from "./Checklist";
import os from "os";

export default class PreflightChecklist {

    private static readonly CHECKLIST = <const>{
        OS_PLATFORM: <Check<typeof IndieEntrypoint>>{
            required: true,
            check() {
                if (os.platform() === "win32") {
                    this.log.fatal("Indie is not built to work for Windows computers.");
                    return false;
                }
                return true;
            }
        },
        OS_PLATFORM_LINUX: <Check<typeof IndieEntrypoint>>{
            check() {
                if (os.platform() !== "linux") {
                    this.log.warn("Indie might not work properly on non-Linux systems.");
                    this.log.warn("If you experience any compatibility issues, please notify the development team.");
                    return false;
                }
                return true;
            }
        }
    };

    // Results
    static R : PerformedChecklist<typeof IndieEntrypoint, typeof PreflightChecklist.CHECKLIST>;

    static run(entrypoint: typeof IndieEntrypoint) : typeof PreflightChecklist.R {
        return this.R = new Checklist(entrypoint).performChecks(this.CHECKLIST);
    }

};

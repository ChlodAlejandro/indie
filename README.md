# Indie
Indie is an in-development project orchestration service based on Node.js, allowing the
orchestration of multiple projects on a single server. Indie is developed with individual
and hobbyist developers in mind, allowing an easy and centralized way to implement
continuous deployment without the need for a containerized system.

The ultimate goal of Indie is to give developers the ability to easily manage their
hobby projects that run on the bare server without compromising on system security.

Indie is currently being built to best suit Unix systems, with Windows support planned
sometime in the future.

## The Problem
As of now, the most-advised method of continuous deployment for individual developers
is to allow a CD provider (such as GitHub Actions) to log into the developer's server
through SSH and run commands there. Although this method definitely works, this requires
a clunky setup that has some caveats:

* You need to open up your SSH server to the public internet,
* You need to have a non-root account on the ready, with permissions only specific to
  the project you're currently working on, and
* You need to trust repository contributors *not* to take over your entire system by
  maliciously modifying the GitHub Action file.

In addition to this, bare-metal processes and jobs that integrate with 
[systemd](https://en.wikipedia.org/wiki/Systemd) require manual editing of `/etc/systemd`
files, which pile on to the amount of manual tweaking you need to do. All these additional 
steps and hacks can summon [Murphy's law](https://en.wikipedia.org/wiki/Murphy%27s_law) 
upon someone's server, and catastrophically ruin a system with many dependent projects.

## The Solution
Indie aims to streamline the process of handling projects on servers, providing some
level of isolation while still allowing bare-metal execution. This is for developers
who own servers and would like to manage many projects on one machine in a very clean
and efficient manner.

![Concept screenshot](/.github/images/sample01.png)

Indie aims to be not just a CLI tool, but also a web interface, with specific endpoints
exposed to allow continuous deployment pipelines such as those integrated with 
GitHub Actions, in order to instantly pull new commits or builds and restart required
services, all configured server-side using a prebuilt process or a custom one.

## The Nitty-Gritty
Instead of relying on a containerization service like Docker, Indie will run each project
under its own user. Although this user is managed by Indie, it can be controlled by any
system user with appropriate permissions using commands like `sudo`.

Indie is supposed to run with root permissions in order to facilitate user and group
management and creation. To ensure security, most activity to be done by Indie, 
such as handling the webserver and internal data, will be performed by a non-root
subprocess, only ever executing commands as root when needed.

Updates to any project will be run using the account dedicated to that project, which
prevents any project from interfering with another project's files. Special actions
such as calling on `systemd` to restart a service will be performed by Indie's root
process. This circumvents the need to provide a project account with `sudo` permissions.

Indie also has a built-in webserver with two functions: (1) allows project management
server through a graphical interface, and (2) allows external CD tools, such as GitHub
Actions, to trigger a deployment.

This essentially means that a GitHub Actions .yml file might look as simple as this:
```yml
# ...
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Update and restart locally
        env:
          UPDATE_KEY: ${{ secrets.UPDATE_KEY }}
        run: "curl https://indie.mywebsite.net/api/update/personal-website?key=${UPDATE_KEY}"
```
and that'll be enough to automatically pull the repository from GitHub and restart the
`systemd` service associated with that project.

This flow is much more secure and has less possible vulnerabilities compared to running
an unrestricted set of commands using an SSH connection, where *many things* can go wrong.

### The Affected
Indie is planned to support and/or use the following services:

| **Service** | **Description** | **Usage** | **Required?** |
|---|---|---|---|
| `adduser` | Allows execution of `adduser` and `addgroup` for easy group generation. | Used to create project accounts, the main `indie-projects` group, and the `indie-admins` management group. | **yes** |
| `sudo` | Allows effective changing of the executing user's UID. | Used to control project accounts, and also allow `indie-admins` users to control project accounts. | **yes** |
| `systemd` | Service management. | Used to create auto-starting services, if enabled. | no |

## When?
Soon. No timeline for release yet, however a working version is expected hopefully by
Q1 to Q2 2022.

## License?
Indie will be licensed under the GNU General Public License v3. This will allow anyone
to download and reproduce the code, and require publicly-available modifications to be
openly-sourced as well.

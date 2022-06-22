# How-To: Build Alephium `desktop-wallet` in Windows (10)

This document is written with the intention of demonstrating the build process in Windows.

**Note**: This guide was written for Windows 10, however the process should be the same for Windows 11. Please make an issue if you come across a Windows 11 specific issue and it will be addressed.

## Getting Started / Prerequisites  

The following software is required:

```
git
nodejs
```

### Instal git

**note**: If you do not plan to contribute to the project, git is not required as the repo can downloaded [directly](https://github.com/alephium/desktop-wallet/archive/refs/heads/master.zip)

After setting up an account on Github, download [Github Desktop](https://desktop.github.com/).


### Instal NodeJS

Navigate to the [NodeJS Offical Installer](https://nodejs.org/en/download/) and download the Windows installer proper for your architecture (for this guide we will elect the `x64` in `.msi` format)

After the download completes, open the installer and complete the wizard (all defaults are fine)

### (Optional) Install a Text Editor

A text editor like [VSCode](https://code.visualstudio.com/docs/?dv=win) is recommended if you plan to contribute or work on the project.





## Building


### Clone the Project

Begin by cloning or downloading the `desktop-wallet` [repo](https://github.com/alephium/desktop-wallet). This can be accomplished by selecting the green `<>Code` button and then electing either `Open with Github Desktop` or `Download ZIP`.

**Note**: If you plan to make changes, its a good idea to go ahead and [create a new branch](https://www.softwaretestinghelp.com/github-desktop-tutorial/) before starting.


### Navigate to the Project Within a Terminal

If VSCode is available, open the project from GitHub Desktop by electing the `Repository` dropdown. located at the top of the window, and then `Open in VSCode`. This will bring up a new window with VSCode. 

One can now open a terminal by right clicking in the browser area and selecting `Open Folder in Integrated Terminal` or by selecting the `Terminal` dropdown, located at the top of the window, and then `New Terminal`

If VSCode is NOT avalible. One can open a new terminal within the local repo with the following steps:

1. Open `File Explorer`
    
2. Navigate to, and open, the repo folder. 
    
3. In the navigation bar type the following:

```
cmd
```

4. A terminal window should appear 

### Build `desktop-wallet`

Install the required depedencies by entering the following command into the terminal window opened in the previous step:

```
npm install
```

The command below will detect your OS and build the corresponding package, enter it into the same terminal window:

```
npm run electron-pack
```


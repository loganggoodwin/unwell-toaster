# Unwell Toaster CLI

**Author:** Logan Garth Goodwin

Unwell Toaster CLI is a funny command-line app about a mentally unstable toaster that slowly loses its grip on reality. This project started as a simple web-based idea and was converted into a Windows-friendly command-line app that can be run from Command Prompt, PowerShell, or by double-clicking a batch file.

## About the Project

This app is designed to be a small, humorous command-line project for GitHub. The toaster has strange thoughts, odd behavior, and random responses that make it feel like a broken appliance with too much personality.

The goal of this project is to demonstrate a simple interactive JavaScript app that can run locally from the command line.

## Features

- Runs from the Windows command line
- Simple interactive text commands
- Funny toaster-themed responses
- Easy launcher using `run.bat`
- Can also be started with Node.js
- Includes a browser version if you want to keep the original HTML project

## Requirements

Before running the command-line version, install **Node.js**.

Download Node.js here:

```text
https://nodejs.org/
```

After installing Node.js, you can check that it installed correctly by opening Command Prompt or PowerShell and typing:

```bash
node -v
```

You should see a version number appear.

## How to Run the App on Windows

### Option 1: Run with the Batch File

The easiest way to run the app is to double-click:

```text
run.bat
```

This will open the command-line version of the Unwell Toaster app.

### Option 2: Run from Command Prompt or PowerShell

Open the project folder, then run:

```bash
node cli.js
```

### Option 3: Run with npm

You can also run the app with npm:

```bash
npm start
```

## Available Commands

Once the app is running, you can type commands into the terminal.

```text
help
status
memory
offer
settings
reset
quit
```

### Command Descriptions

| Command | What It Does |
|---|---|
| `help` | Shows the list of available commands |
| `status` | Checks the toaster’s current condition |
| `memory` | Displays strange toaster memories |
| `offer` | Offers something to the toaster |
| `settings` | Shows the toaster’s unstable settings |
| `reset` | Attempts to reset the toaster |
| `quit` | Exits the app |

## Project Files

```text
unwell-toaster/
│
├── cli.js          # Command-line version of the app
├── run.bat         # Windows launcher
├── package.json    # Node.js project settings
├── index.html      # Original browser version
├── style.css       # Browser styling
├── script.js       # Browser JavaScript
└── README.md       # Project documentation
```

## Running the Original Browser Version

The original version can still be opened in a browser.

Open:

```text
index.html
```

This will launch the web version of the project.

## Why I Made This

I wanted to create a funny GitHub project with personality. The idea of a mentally unstable toaster sounded ridiculous enough to be memorable, while still giving me a simple project that could show JavaScript, command-line interaction, and basic project organization.

## Future Improvements

Some possible future updates include:

- More random toaster responses
- Sound effects
- ASCII art
- Save/load toaster mood settings
- More commands
- A full installer for Windows
- A packaged `.exe` version

## License

This project is for educational and personal portfolio use.

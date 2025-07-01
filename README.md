<div align="center">
  <h1>anchor-init</h1>
  <p>Scaffold a custom Solana Anchor program in seconds</p>
  
  <a class="header-badge" target="_blank" href="https://twitter.com/priyansh_ptl18"> <img alt="Twitter" src="https://img.shields.io/badge/@priyansh_ptl18-000000?style=for-the-badge&logo=x&logoColor=white"> </a>
</div>

## About

anchor-init is a command-line tool designed to quickly scaffold Solana Anchor programs with best practices. It generates a new project with a custom programId, sets up the proper directory structure for Anchor development, and provides an interactive setup experience to get you coding faster.

## Features

- Fast project scaffolding with custom programId generation
- Handlebars template system for easy customization
- Automatic initial build process
- Interactive setup with customizable steps
- Optional Git repository initialization
- Smart project name validation and conversion
- One-c0mmand full setup with `--all` flag
- Enhanced error detection and helpful suggestions

## Installation

### From npm
```bash
npm install -g anchor-init
```

### From Source
1. Clone the repository
   ```bash
   git clone https://github.com/priyanshpatel18/anchor-init.git
   cd anchor-init
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Link globally
   ```bash
   npm link
   ```

## Usage

### Basic Usage
```bash
anchor-init my_project
```

### Advanced Usage

#### Full automated setup
```bash
anchor-init my_project --all --git
```

#### Available Options
- `--all`: Run all setup steps automatically (keys sync, build, install, deploy, test)
- `--git`: Initialize a Git repository automatically
- `-h, --help`: Display help information

### What happens when you run anchor-init?

1. **Project Creation**: Creates a new directory with your project name (converted to snake_case if needed)
2. **Program ID Generation**: Generates a unique Solana program ID using a new keypair
3. **Template Processing**: Copies and processes Handlebars templates with your project context
4. **Initial Build**: Runs `anchor build` to ensure everything compiles
5. **Interactive Setup**: Prompts you to select additional steps to run:
   - `anchor keys sync` - Sync program keys
   - `anchor build` - Build the program
   - `yarn install` - Install dependencies
   - `yarn deploy:local` - Deploy to local validator
   - `yarn test:local` - Run tests
6. **Git Initialization**: Optionally initialize a Git repository

### Examples

#### Basic project creation
```bash
anchor-init cool_project
```

#### Full setup with Git
```bash
anchor-init my-awesome-program --all --git
```

#### Manual step selection
```bash
anchor-init my_project
# Then select which steps to run from the interactive menu
```

## Project Structure

After running anchor-init, you'll get a complete Anchor project structure:

```
my_project/
├── programs/
│   └── my_project/
│       ├── src/
│       │   └── lib.rs
│       └── Cargo.toml
├── tests/
│   └── my_project.ts
├── migrations/
├── app/
├── Anchor.toml
├── .gitignore
├── Cargo.toml
├── package.json
└── tsconfig.json
```

## Error Handling

anchor-init includes intelligent error detection:

- **Connection Issues**: Detects when Solana test validator isn't running
- **WebSocket Errors**: Identifies validator connectivity problems  
- **Test Issues**: Helps troubleshoot missing test files
- **Build Failures**: Provides clear error messages and suggestions

## Development

### Local Testing
```bash
git clone https://github.com/priyanshpatel18/anchor-init.git
cd anchor-init
npm install
npm link
anchor-init test_project
```

### Template Development

The tool uses Handlebars templates located in the `templates/` directory. Available template variables:
- `{{projectName}}` - Snake case project name
- `{{programId}}` - Generated program ID
- `{{PascalCase projectName}}` - Pascal case helper
- `{{camelCase projectName}}` - Camel case helper

## Prerequisites

- Node.js (v14 or higher)
- Anchor CLI installed and configured
- Solana CLI tools
- Yarn package manager

## Troubleshooting

### Common Issues

**"anchor build failed"**
- Ensure Anchor CLI is properly installed
- Check that Rust toolchain is up to date

**"Connection refused" during deploy**
- Start the Solana test validator: `solana-test-validator`
- Or use: `anchor test-validator`

**"No test files found"**
- Ensure test files exist in `tests/**/*.ts`
- Check that test files follow proper naming convention

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Made with ❤️ for the Solana ecosystem</p>
</div>
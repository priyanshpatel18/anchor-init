<div align="center">
  <h1>anchor-init</h1>
  <p>Scaffold a custom Solana Anchor program in seconds</p>
  
  <a class="header-badge" target="_blank" href="https://twitter.com/priyansh_ptl18"> <img alt="Twitter" src="https://img.shields.io/badge/@priyansh_ptl18-000000?style=for-the-badge&logo=x&logoColor=white"> </a> </div>

</div>

## About

anchor-init is a command-line tool designed to quickly scaffold Solana Anchor programs with best practices. It generates a new project with a custom programId and sets up the proper directory structure for Anchor development.

## Features

- Fast project scaffolding with custom programId generation
- Handlebars template system for easy customization
- Automatic initial build process
- Simple command-line interface

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

### Create a new project
```bash
anchor-init my_project
```

This will:
- Create a new Anchor project at `./my_project`
- Generate a unique Solana programId
- Run initial `anchor build`
- Display next steps

### Example
```bash
# Create a new project
anchor-init cool_project

# Navigate to your project
cd cool_project

# Follow the displayed next steps
anchor keys sync
anchor build
yarn
yarn test:local
```

## Development

To test locally:
```bash
git clone https://github.com/priyanshpatel18/anchor-init.git
cd anchor-init
npm install
npm link
anchor-init test_project
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT - see the [LICENSE](LICENSE) file for details.
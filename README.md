# anchor-init 🧱

Scaffold a custom [Solana Anchor](https://project-serum.github.io/anchor/) program in seconds.

## ✨ Features

- Generates a new Anchor project with a custom programId
- Uses Handlebars templates for easy customization
- Includes recommended build/test commands
- Zero-config setup for Solana development

## 📦 Installation

```bash
npm install -g anchor-init
```

## 🚀 Usage

```bash
anchor-init my_project
```

This will:
* Scaffold a new Anchor program at `./my_project`
* Generate a new Solana `programId`
* Run an initial `anchor build`
* Print the recommended post-setup steps

## 🛠️ Post-setup Commands

After project creation, you'll be prompted to run:

```bash
cd my_project
anchor keys sync
anchor build
yarn
yarn test:local
```

## 📁 Template Structure

Templates live under the `templates/` directory and use `.hbs` Handlebars syntax. You can customize them to fit your project needs.

## 👷 Development

To test locally:

```bash
git clone <your-repo>
cd anchor-init
npm link
anchor-init test_project
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the [Solana](https://solana.com/) and [Anchor](https://project-serum.github.io/anchor/) ecosystem
- Inspired by modern scaffolding tools like `create-react-app`
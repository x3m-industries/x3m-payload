# Contributing to @x3m/payload

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Workflow

1.  **Fork and Clone**: Fork the repo and clone it locally.
2.  **Install Dependencies**: We use Yarn 4. Run `yarn install`.
3.  **Branching**: Create a branch for your feature or fix.
    ```bash
    git checkout -b feat/my-new-feature
    ```
4.  **Make Changes**: Implement your changes.
5.  **Commit**: We use **Conventional Commits**.

    ```bash
    git commit -m "feat: add amazing new feature"
    ```

    - `feat`: A new feature
    - `fix`: A bug fix
    - `docs`: Documentation only changes
    - `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
    - `refactor`: A code change that neither fixes a bug nor adds a feature
    - `perf`: A code change that improves performance
    - `test`: Adding missing tests or correcting existing tests
    - `build`: Changes that affect the build system or external dependencies
    - `ci`: Changes to our CI configuration files and scripts
    - `chore`: Other changes that don't modify src or test files
    - `revert`: Reverts a previous commit

6.  **Version Changes**: If your changes affect the published packages, you **MUST** add a changeset.

    ```bash
    yarn changeset
    ```

    Follow the prompts to select packages and bump functionality (major/minor/patch).

7.  **Validate**: Ensure everything is correct.
    ```bash
    yarn validate
    ```
8.  **Push and PR**: Push your branch and open a Pull Request.

## Pull Request Process

1.  Ensure you have added a changeset if necessary.
2.  Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters.
3.  The PR template will help you verify you've done everything needed.

## License

By contributing, you agree that your contributions will be licensed under its MIT License.

{
  description = "JavaScript/TypeScript web-development shell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_22

            # Language servers
            vscode-langservers-extracted
            tailwindcss-language-server

            # Debugger
            vscode-js-debug
          ];

          shellHook = ''
            # Install project dependencies
            if [ ! -d "node_modules" ]; then
              echo "Running npm install..."
              npm install
            fi

            # Put project-local binaries (vite, tsc, eslint...) on PATH.
            export PATH="$PWD/node_modules/.bin:$PATH"
          '';
        };

        formatter = pkgs.nixfmt;
      }
    );
}

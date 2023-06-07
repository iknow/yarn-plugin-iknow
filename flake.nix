{
  description = "yarn-plugin-iknow";

  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";
  inputs.berry2nix-src = {
    url = "github:iknow/berry2nix";
    flake = false;
  };

  outputs = { self, nixpkgs, flake-utils, berry2nix-src }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        berry2nix = pkgs.callPackage (berry2nix-src + "/lib.nix") {};

        yarn-patched = berry2nix.mkYarnBin {
          yarnPath = pkgs.callPackage (berry2nix-src + "/yarn/yarn.nix") {};
          isPatchedForGlobalCache = true;
        };
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs
            yarn-patched
          ];
        };
      }
    );
}
